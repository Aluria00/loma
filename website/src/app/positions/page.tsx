import { AllocationBar } from "@/components/AllocationBar";
import { PortalHeader } from "@/components/PortalHeader";
import { PositionsTable } from "@/components/PositionsTable";
import {
  formatInteger,
  formatSignedPct,
  formatSignedUsd,
  formatUsd,
  gainPct,
  groupPositionsByCompany,
  summarizeCompanies,
  type PositionRow,
} from "@/lib/portfolio";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <main className="min-h-screen bg-background">
        <PortalHeader name={profile?.full_name} email={profile?.email} />
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base">Could not load positions</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
          </Card>
        </div>
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
  const summaryGainPct = gainPct(summary.gain, summary.cost);

  return (
    <main className="min-h-screen bg-background">
      <PortalHeader name={profile?.full_name} email={profile?.email} />

      <div className="mx-auto max-w-6xl px-6 pt-8 pb-5 md:px-10">
        <h1 className="font-[family-name:var(--font-newsreader)] text-[28px] leading-tight font-normal tracking-[-0.02em] text-muted-foreground">
          Your positions
        </h1>

        <div className="mt-4">
          <p
            className="font-[family-name:var(--font-newsreader)] text-[36px] leading-none tracking-tight text-foreground tabular-nums md:text-[40px]"
          >
            {formatUsd(summary.fmv)}
          </p>
          <p className="mt-1 text-sm tabular-nums">
            <span
              className={
                summary.gain >= 0 ? "text-brand-2" : "text-destructive"
              }
            >
              {formatSignedUsd(summary.gain)}
            </span>
            <span className="text-faint">
              {" "}
              ({formatSignedPct(summaryGainPct)})
            </span>
          </p>
          <p className="mt-3 text-xs text-faint">
            <span>
              Cost basis{" "}
              <span className="tabular-nums text-muted-foreground">
                {formatUsd(summary.cost)}
              </span>
            </span>
            <span className="mx-2 text-border">·</span>
            <span>
              {formatInteger(summary.count)}{" "}
              {summary.count === 1 ? "company" : "companies"}
            </span>
            <span className="mx-2 text-border">·</span>
            <span>Marked to latest FMV</span>
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
        <Card className="gap-0 !overflow-visible border-0 bg-card py-0 shadow-none">
          <CardHeader className="gap-0 space-y-0 px-4 pt-4 pb-0 sm:px-5">
            <CardTitle className="text-base font-medium tracking-tight text-foreground">
              Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-visible px-0 pt-0 pb-0">
            {companyRows.length === 0 ? (
              <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                No positions yet.
              </p>
            ) : (
              <>
                <div className="overflow-visible px-4 py-4 sm:px-5">
                  <AllocationBar rows={companyRows} totalFmv={summary.fmv} />
                </div>
                <div className="overflow-x-auto border-t border-border px-1 sm:px-2">
                  <p className="px-2.5 pt-2.5 pb-1 text-[10px] text-faint sm:px-3">
                    Rows with multiple tranches can be expanded.
                  </p>
                  <PositionsTable rows={companyRows} totalFmv={summary.fmv} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-6 text-[11px] leading-relaxed text-faint">
          Values reflect marked fair-market estimates and may change. This page
          is for informational purposes only and does not constitute an offer or
          solicitation.
        </p>
      </section>
    </main>
  );
}
