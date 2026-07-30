-- Loma LP Portal schema
-- profiles, funds, companies, positions + RLS

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'lp' check (role in ('lp', 'admin')),
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.funds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vintage integer,
  created_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text,
  notes text,
  created_at timestamptz not null default now(),
  unique (legal_name)
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  lp_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id),
  fund_id uuid references public.funds (id),
  investment_type text not null,
  purchase_date date,
  shares numeric(20, 10),
  cost_basis numeric(18, 2) not null default 0,
  valuation_at_purchase numeric(20, 2),
  fmv numeric(18, 2) not null default 0,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'exited')),
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index positions_lp_id_idx on public.positions (lp_id);
create index positions_company_id_idx on public.positions (company_id);
create index positions_status_idx on public.positions (status);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'lp')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger positions_updated_at
  before update on public.positions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.funds enable row level security;
alter table public.companies enable row level security;
alter table public.positions enable row level security;

-- Profiles: own row, or any if admin
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_all"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Funds: readable by authenticated; writable by admin
create policy "funds_select_authenticated"
  on public.funds for select
  to authenticated
  using (true);

create policy "funds_admin_write"
  on public.funds for all
  using (public.is_admin())
  with check (public.is_admin());

-- Companies: readable if linked to own position, or admin; write admin
create policy "companies_select_own_positions_or_admin"
  on public.companies for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.positions p
      where p.company_id = companies.id and p.lp_id = auth.uid()
    )
  );

create policy "companies_admin_write"
  on public.companies for all
  using (public.is_admin())
  with check (public.is_admin());

-- Positions: own rows, or admin
create policy "positions_select_own_or_admin"
  on public.positions for select
  using (lp_id = auth.uid() or public.is_admin());

create policy "positions_admin_write"
  on public.positions for all
  using (public.is_admin())
  with check (public.is_admin());
