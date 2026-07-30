# Loma website

Single Next.js app for the public marketing site and LP portal.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000):

| Path | Access |
|------|--------|
| `/` | Marketing site (public) |
| `/login` | LP Portal sign-in (public) |
| `/positions` | Partner positions (auth required) |

## Setup

1. Copy `.env.example` → `.env.local` and fill Supabase keys (no LP passwords here).
2. Apply schema: `npm run db:migrate` (needs `DATABASE_URL` + `psql`).
3. Create an LP (Auth + `profiles` row):

```bash
npm run provision-lp -- --email=amir@firestrke.ai --password='…' --name="Amir Luria"
```

4. Seed sample positions for that LP:

```bash
npm run seed -- --email=amir@firestrke.ai
```

LP identity lives in `profiles`; passwords live in Supabase Auth (`auth.users`) — never in `.env` or a custom passwords table.

## Layout

```
website/
├── public/marketing/   # Marketing SPA (served at /)
├── src/app/login/      # LP login (matches marketing design)
├── src/app/positions/  # Authenticated dashboard
└── supabase/           # Schema + RLS
```
