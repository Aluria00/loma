import { SignOutButton } from "@/components/SignOutButton";
import { PositionsTable } from "@/components/PositionsTable";
import { ThemeToggle } from "@/components/ThemeProvider";
import {
  formatUsd,
  groupPositionsByCompany,
  summarizeCompanies,
  type PositionRow,
} from "@/lib/portfolio";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  const { data: positions, error } = await supabase
    .from("positions")
    .select(
      `
      id,
      investment_type,
      purchase_date,
      shares,
      cost_basis,
      valuation_at_purchase,
      fmv,
      status,
      companies (
        id,
        legal_name,
        display_name
      )
    `
    )
    .eq("lp_id", user.id)
    .order("purchase_date", { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <p className="text-sm text-destructive">
          Could not load positions: {error.message}
        </p>
      </main>
    );
  }

  const rows: PositionRow[] = (positions ?? []).map((row) => {
    const company = Array.isArray(row.companies)
      ? row.companies[0] ?? null
      : row.companies;
    return {
      id: row.id,
      investment_type: row.investment_type,
      purchase_date: row.purchase_date,
      shares: row.shares == null ? null : Number(row.shares),
      cost_basis: Number(row.cost_basis),
      valuation_at_purchase:
        row.valuation_at_purchase == null
          ? null
          : Number(row.valuation_at_purchase),
      fmv: Number(row.fmv),
      status: row.status,
      companies: company,
    };
  });
  const companyRows = groupPositionsByCompany(rows);
  const summary = summarizeCompanies(companyRows);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6 md:px-10">
          <a href="/" className="t-brand text-brand no-underline">
            Loma
          </a>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="text-xs text-foreground">
                {profile?.full_name || "Partner"}
              </div>
              <div className="text-xs text-muted-foreground">{profile?.email}</div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-14 pb-8 md:px-10">
        <p className="t-eyebrow mb-3 text-brand-2">LP Portal</p>
        <h1 className="t-title text-foreground">Your positions</h1>
        <p className="t-lead mt-2 max-w-xl text-muted-foreground">
          Portfolio holdings as of the latest marked fair-market values.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryStat label="Companies" value={String(summary.count)} />
          <SummaryStat label="Cost basis" value={formatUsd(summary.cost)} />
          <SummaryStat label="Fair market value" value={formatUsd(summary.fmv)} />
          <SummaryStat
            label="Unrealized gain/loss"
            value={formatUsd(summary.gain)}
            accent={summary.gain >= 0}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 md:px-10">
        <Card className="border-border bg-card/80 shadow-none">
          <CardContent className="p-0 sm:p-1">
            {companyRows.length === 0 ? (
              <p className="t-lead px-6 py-12 text-center text-muted-foreground">
                No positions yet.
              </p>
            ) : (
              <div className="px-2 py-2 sm:px-4 sm:py-3">
                <PositionsTable rows={companyRows} totalFmv={summary.fmv} />
              </div>
            )}
          </CardContent>
        </Card>
        <Separator className="mt-8 opacity-40" />
        <p className="mt-4 text-xs text-muted-foreground">
          Values reflect marked fair-market estimates and may change.
        </p>
      </section>

      <ThemeToggle />
    </main>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          {label}
        </p>
        <p
          className={`mt-2 font-[family-name:var(--font-newsreader)] text-[22px] tabular-nums tracking-tight ${
            accent ? "text-brand" : "text-foreground"
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
