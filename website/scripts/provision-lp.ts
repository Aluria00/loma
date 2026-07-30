/**
 * Create or update an LP in Supabase Auth + public.profiles.
 *
 * Passwords live in auth.users (Supabase Auth). Identity lives in profiles.
 * Never put LP passwords in .env.local.
 *
 * Usage:
 *   npm run provision-lp -- --email=amir@firestrke.ai --password='…' --name="Amir Luria"
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
const password = arg("password");
const fullName = arg("name")?.trim() || "Partner";
const role = arg("role") === "admin" ? "admin" : "lp";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!email || !password) {
  console.error(
    "Usage: npm run provision-lp -- --email=user@example.com --password='…' [--name='Full Name']"
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    perPage: 200,
  });
  if (listError) throw listError;

  const existing = listed.users.find(
    (u) => u.email?.toLowerCase() === email
  );

  let userId: string;

  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (error) throw error;
    console.log(`Updated auth user ${email} (${userId})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    userId = data.user.id;
    console.log(`Created auth user ${email} (${userId})`);
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email,
    full_name: fullName,
    role,
    is_test: false,
  });
  if (profileError) throw profileError;

  console.log(`Upserted profiles row for ${fullName} <${email}>`);
  console.log("Sign in at /login with that email and password.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
