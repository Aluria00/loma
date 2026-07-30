"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-3">
      <Input
        type="email"
        name="email"
        required
        autoComplete="username"
        autoFocus
        placeholder="Email"
        spellCheck={false}
        className="h-11 rounded-[10px] bg-background text-[15px]"
      />
      <Input
        type="password"
        name="password"
        required
        autoComplete="current-password"
        placeholder="Password"
        className="h-11 rounded-[10px] bg-background text-[15px]"
      />

      {state.error ? (
        <p className="t-caption text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="mt-4 h-11 w-full rounded-[10px] text-[13.5px]"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
