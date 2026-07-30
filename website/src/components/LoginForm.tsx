"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-medium text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="username"
          autoFocus
          placeholder="partner@firm.com"
          spellCheck={false}
          className="h-11 bg-background text-[15px]"
        />
      </div>
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-xs font-medium text-foreground"
        >
          Password
        </Label>
        <Input
          id="password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-11 bg-background text-[15px]"
        />
      </div>

      {state.error ? (
        <p className="text-xs text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="mt-2 h-11 w-full text-sm font-medium"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
