import { LoginDotfield } from "@/components/LoginDotfield";
import { LoginForm } from "@/components/LoginForm";
import { ThemeToggle } from "@/components/ThemeProvider";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <LoginDotfield />
      <div className="relative z-2 w-full max-w-[400px]">
        <a
          href="/"
          className="t-brand mb-9 block text-center text-brand no-underline"
        >
          Loma
        </a>

        <Card className="relative z-2 border-border bg-card shadow-sm">
          <CardContent className="px-8 py-9">
            <p className="t-eyebrow mb-3.5 text-brand-2">LP Portal</p>
            <h1 className="t-title mb-2.5 text-foreground">Sign in</h1>
            <p className="t-lead mb-6 text-muted-foreground">
              Use your partner email and password.
            </p>

            <LoginForm />

            <p className="t-caption mt-6 text-center text-muted-foreground/80">
              Access is limited to existing Loma partners.
              <br />
              <br />
              New partners:{" "}
              <a
                href="mailto:partners@loma.capital"
                className="t-link text-brand-2 no-underline border-b border-brand-2/45"
              >
                partners@loma.capital
              </a>
            </p>
          </CardContent>
        </Card>

        <a
          href="/"
          className="t-link mt-6 block text-center text-muted-foreground/80 no-underline transition-colors hover:text-muted-foreground"
        >
          ← Back to site
        </a>
      </div>

      <ThemeToggle />
    </div>
  );
}
