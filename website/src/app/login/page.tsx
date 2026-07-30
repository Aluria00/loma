import { LoginForm } from "@/components/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,color-mix(in_srgb,var(--brand)_12%,transparent),transparent)]"
      />

      <div className="relative z-10 w-full max-w-[400px]">
        <a
          href="/"
          className="mb-10 block text-center font-[family-name:var(--font-newsreader)] text-[26px] font-medium tracking-[-0.01em] text-brand no-underline"
        >
          Loma
        </a>

        <Card className="gap-0 border-border bg-card py-0 shadow-sm">
          <CardHeader className="px-8 pt-8 pb-2">
            <p className="mb-2 text-xs font-medium tracking-[0.14em] text-brand-2 uppercase">
              LP Portal
            </p>
            <CardTitle className="font-[family-name:var(--font-newsreader)] text-[28px] font-normal tracking-[-0.02em]">
              Sign in
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              Partner credentials only.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pt-4 pb-8">
            <LoginForm />

            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
              Access is limited to existing Loma partners.
              <br />
              New partners:{" "}
              <a
                href="mailto:partners@loma.capital"
                className="font-medium text-brand-2 underline-offset-4 hover:underline"
              >
                partners@loma.capital
              </a>
            </p>
          </CardContent>
        </Card>

        <a
          href="/"
          className="mt-6 block text-center text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
        >
          ← Back to site
        </a>
      </div>
    </div>
  );
}
