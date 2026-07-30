/**
 * Seed sample-sheet positions for an existing LP (looked up by email in profiles).
 *
 * Does not create users or touch passwords — use `npm run provision-lp` for that.
 *
 * Usage:
 *   npm run seed -- --email=amir@firestrke.ai
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = arg("email")?.trim().toLowerCase();

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!email) {
  console.error("Usage: npm run seed -- --email=user@example.com");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type SeedPosition = {
  company: string;
  displayName?: string;
  investmentType: string;
  purchaseDate: string | null;
  shares: number | null;
  costBasis: number;
  valuationAtPurchase: number | null;
  fmv: number;
  status: "active" | "inactive" | "exited";
};

/** Sample sheet rows (boss portfolio). */
const POSITIONS: SeedPosition[] = [
  {
    company: "Cerebras Technologies, Inc.",
    investmentType: "Equity: Common Shares",
    purchaseDate: "2023-07-01",
    shares: 1000,
    costBasis: 8750,
    valuationAtPurchase: 1340573179.52,
    fmv: 300000,
    status: "active",
  },
  {
    company: "Alere, LLC",
    displayName: "Alere, LLC (dba SovDoc)",
    investmentType: "Convertible: SAFE @ Seed",
    purchaseDate: "2024-10-30",
    shares: null,
    costBasis: 5800,
    valuationAtPurchase: null,
    fmv: 5800,
    status: "active",
  },
  {
    company: "Fundamental Technologies Inc.",
    investmentType: "Seed",
    purchaseDate: "2024-12-20",
    shares: 1048.218029,
    costBasis: 5000,
    valuationAtPurchase: 70000000,
    fmv: 66142.56,
    status: "active",
  },
  {
    company: "Fundamental Technologies Inc.",
    investmentType: "Series A-1 Preferred (Via SAFE)",
    purchaseDate: "2024-12-20",
    shares: 713.1537242,
    costBasis: 36000,
    valuationAtPurchase: 1600000000,
    fmv: 45000,
    status: "active",
  },
  {
    company: "SpaceX",
    displayName: "SpaceX (AEROSPACE GROWTH INVESTMENTS LLC CLASS 1E)",
    investmentType: "SPV",
    purchaseDate: "2025-02-20",
    shares: 270.2702703,
    costBasis: 10000,
    valuationAtPurchase: 350000000,
    fmv: 45945.95,
    status: "active",
  },
  {
    company: "LUMVER LLC",
    displayName: "LUMVER LLC (dba Omniflow)",
    investmentType: "Convertible: SAFE",
    purchaseDate: "2025-02-28",
    shares: null,
    costBasis: 10000,
    valuationAtPurchase: null,
    fmv: 10000,
    status: "inactive",
  },
  {
    company: "Replit",
    displayName: "Replit (First Momentum Capital Management LLC)",
    investmentType: "SPV",
    purchaseDate: "2025-07-24",
    shares: 83.25918063,
    costBasis: 8000,
    valuationAtPurchase: 3000000000,
    fmv: 20669.92,
    status: "active",
  },
  {
    company: "Perplexity",
    displayName: "Perplexity (Seafront Opportunity Fund II LLC)",
    investmentType: "SPV",
    purchaseDate: "2025-09-02",
    shares: 10.065515,
    costBasis: 7000,
    valuationAtPurchase: 20000000000,
    fmv: 7000,
    status: "active",
  },
  {
    company: "Kalshi",
    displayName: "Kalshi (Sethi Capital z4 LLC)",
    investmentType: "SPV",
    purchaseDate: "2026-01-20",
    shares: 31.17549738,
    costBasis: 10000,
    valuationAtPurchase: 11000000000,
    fmv: 10000,
    status: "active",
  },
  {
    company: "Fundamental Technologies Inc.",
    investmentType: "Series A Preferred",
    purchaseDate: "2026-02-02",
    shares: 475.4358162,
    costBasis: 30000,
    valuationAtPurchase: 1200000000,
    fmv: 30000,
    status: "active",
  },
  {
    company: "Harmonize Health Inc.",
    investmentType: "Seed",
    purchaseDate: "2026-04-26",
    shares: null,
    costBasis: 10000,
    valuationAtPurchase: 8000000,
    fmv: 10000,
    status: "active",
  },
  {
    company: "Synthetic Turning Experience Technologies Inc.",
    investmentType: "Seed",
    purchaseDate: "2026-05-26",
    shares: null,
    costBasis: 15000,
    valuationAtPurchase: 30000000,
    fmv: 15000,
    status: "active",
  },
  {
    company: "FL2024-008, Inc.",
    displayName: "FL2024-008, Inc. (AI Innovation IV) (Project Prometheus)",
    investmentType: "Series B",
    purchaseDate: "2026-05-27",
    shares: 248.24,
    costBasis: 10000,
    valuationAtPurchase: 38000000,
    fmv: 10000,
    status: "active",
  },
  {
    company: "Arlo Industries Inc.",
    investmentType: "Seed (SAFE)",
    purchaseDate: "2026-06-01",
    shares: null,
    costBasis: 18000,
    valuationAtPurchase: null,
    fmv: 18000,
    status: "active",
  },
  {
    company: "Stochastic Processes",
    investmentType: "Seed (SAFE)",
    purchaseDate: "2026-06-29",
    shares: null,
    costBasis: 5000,
    valuationAtPurchase: 50000000,
    fmv: 5000,
    status: "active",
  },
  {
    company: "Uno Technologies, Inc.",
    investmentType: "Seed (SAFE)",
    purchaseDate: "2026-07-02",
    shares: null,
    costBasis: 18000,
    valuationAtPurchase: 30000000,
    fmv: 18000,
    status: "active",
  },
  {
    company: "Decart.AI, Inc.",
    investmentType: "Series B",
    purchaseDate: "2026-07-23",
    shares: null,
    costBasis: 10000,
    valuationAtPurchase: 3800000000,
    fmv: 10000,
    status: "active",
  },
];

async function ensureFund(): Promise<string> {
  const { data: existing } = await admin
    .from("funds")
    .select("id")
    .eq("name", "Loma Capital")
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await admin
    .from("funds")
    .insert({ name: "Loma Capital", vintage: 2023 })
    .select("id")
    .single();

  if (error || !data) throw new Error(`fund insert: ${error?.message}`);
  return data.id;
}

async function ensureCompany(
  legalName: string,
  displayName?: string
): Promise<string> {
  const { data: existing } = await admin
    .from("companies")
    .select("id")
    .eq("legal_name", legalName)
    .maybeSingle();

  if (existing) {
    if (displayName) {
      await admin
        .from("companies")
        .update({ display_name: displayName })
        .eq("id", existing.id);
    }
    return existing.id;
  }

  const { data, error } = await admin
    .from("companies")
    .insert({
      legal_name: legalName,
      display_name: displayName ?? null,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(`company insert: ${error?.message}`);
  return data.id;
}

async function main() {
  console.log(`Seeding positions for ${email}…`);

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .eq("email", email)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) {
    console.error(
      `No profiles row for ${email}. Create the LP first:\n` +
        `  npm run provision-lp -- --email=${email} --password='…' --name="Amir Luria"`
    );
    process.exit(1);
  }

  const fundId = await ensureFund();

  const { error: delError } = await admin
    .from("positions")
    .delete()
    .eq("lp_id", profile.id);
  if (delError) throw new Error(`clear positions: ${delError.message}`);

  for (const row of POSITIONS) {
    const companyId = await ensureCompany(row.company, row.displayName);
    const { error } = await admin.from("positions").insert({
      lp_id: profile.id,
      company_id: companyId,
      fund_id: fundId,
      investment_type: row.investmentType,
      purchase_date: row.purchaseDate,
      shares: row.shares,
      cost_basis: row.costBasis,
      valuation_at_purchase: row.valuationAtPurchase,
      fmv: row.fmv,
      status: row.status,
      is_test: false,
    });
    if (error) {
      throw new Error(`position insert (${row.company}): ${error.message}`);
    }
  }

  console.log(
    `Seeded ${POSITIONS.length} positions for ${profile.full_name} <${profile.email}>`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
