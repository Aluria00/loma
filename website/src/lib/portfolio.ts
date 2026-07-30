export type PositionStatus = "active" | "inactive" | "exited";

export type PositionRow = {
  id: string;
  investment_type: string;
  purchase_date: string | null;
  shares: number | null;
  cost_basis: number;
  valuation_at_purchase: number | null;
  fmv: number;
  status: PositionStatus;
  companies: {
    id?: string;
    legal_name: string;
    display_name: string | null;
  } | null;
};

export type CompanyPositionRow = {
  companyKey: string;
  name: string;
  investmentTypes: string[];
  firstPurchaseDate: string | null;
  shares: number | null;
  costBasis: number;
  fmv: number;
  status: PositionStatus;
  roundCount: number;
  positions: PositionRow[];
};

export function formatUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatShares(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(value);
}

export function formatPct(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function companyLabel(row: PositionRow): string {
  return row.companies?.display_name || row.companies?.legal_name || "Unknown";
}

export function summarizePositions(rows: PositionRow[]) {
  const active = rows.filter((r) => r.status === "active");
  const cost = active.reduce((s, r) => s + Number(r.cost_basis || 0), 0);
  const fmv = active.reduce((s, r) => s + Number(r.fmv || 0), 0);
  return {
    cost,
    fmv,
    gain: fmv - cost,
    count: active.length,
  };
}

export function summarizeCompanies(rows: CompanyPositionRow[]) {
  const active = rows.filter((r) => r.status === "active");
  const cost = active.reduce((s, r) => s + r.costBasis, 0);
  const fmv = active.reduce((s, r) => s + r.fmv, 0);
  return {
    cost,
    fmv,
    gain: fmv - cost,
    count: active.length,
  };
}

export function assetPct(fmv: number, totalFmv: number): number {
  if (!totalFmv) return 0;
  return (Number(fmv) / totalFmv) * 100;
}

function companyKey(row: PositionRow): string {
  return (
    row.companies?.id ||
    row.companies?.legal_name ||
    companyLabel(row)
  );
}

/** Collapse position rounds into one row per company. */
export function groupPositionsByCompany(
  rows: PositionRow[]
): CompanyPositionRow[] {
  const map = new Map<string, PositionRow[]>();

  for (const row of rows) {
    const key = companyKey(row);
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }

  const groups: CompanyPositionRow[] = [];

  for (const [key, positions] of map) {
    const sorted = [...positions].sort((a, b) => {
      const da = a.purchase_date || "";
      const db = b.purchase_date || "";
      return da.localeCompare(db);
    });

    const active = sorted.filter((p) => p.status === "active");
    const forTotals = active.length > 0 ? active : sorted;
    const status: PositionStatus =
      active.length > 0 ? "active" : sorted[0]?.status || "inactive";

    const shareValues = forTotals
      .map((p) => p.shares)
      .filter((s): s is number => s != null && !Number.isNaN(s));

    groups.push({
      companyKey: key,
      name: companyLabel(sorted[0]),
      investmentTypes: sorted.map((p) => p.investment_type),
      firstPurchaseDate: sorted[0]?.purchase_date ?? null,
      shares: shareValues.length ? shareValues.reduce((a, b) => a + b, 0) : null,
      costBasis: forTotals.reduce((s, p) => s + Number(p.cost_basis || 0), 0),
      fmv: forTotals.reduce((s, p) => s + Number(p.fmv || 0), 0),
      status,
      roundCount: sorted.length,
      positions: sorted,
    });
  }

  return groups.sort((a, b) => b.fmv - a.fmv);
}
