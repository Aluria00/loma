"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type LoginState = {
  error: string | null;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[login]", { email, passwordLength: password.length });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.info("[login] auth error", error.message, error.status);
    }
    return { error: error.message };
  }

  redirect("/positions");
}
