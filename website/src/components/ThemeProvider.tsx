"use client";

import { useEffect, type ReactNode } from "react";

/** LP portal is light-only — matches institutional readability + marketing brand. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", "light");
    root.classList.remove("dark");
  }, []);

  return <>{children}</>;
}
