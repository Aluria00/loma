"use client";

import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";

function initials(name?: string | null, email?: string | null) {
  const source = (name || email || "P").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function PortalHeader({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const router = useRouter();
  const displayName = name || "Partner";

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6 md:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/positions"
            className="font-[family-name:var(--font-newsreader)] text-[22px] font-medium tracking-[-0.01em] text-brand no-underline"
          >
            Loma
          </Link>
          <span aria-hidden className="hidden h-4 w-px bg-border sm:block" />
          <span className="hidden text-[11px] font-medium tracking-[0.1em] text-faint uppercase sm:inline">
            LP Portal
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
          >
            <Avatar size="sm" className="border border-border bg-secondary">
              <AvatarFallback className="bg-secondary text-xs font-medium text-foreground">
                {initials(name, email)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[10rem] truncate sm:inline">
              {displayName}
            </span>
            <ChevronDownIcon className="size-3.5 shrink-0 text-faint" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56 p-1">
            <DropdownMenuGroup>
              <DropdownMenuLabel
                className="space-y-0.5 px-2 py-1.5 font-sans font-normal text-foreground"
              >
                <p className="truncate text-sm font-medium leading-none">
                  {displayName}
                </p>
                {email ? (
                  <p className="truncate text-xs font-normal leading-none text-muted-foreground">
                    {email}
                  </p>
                ) : null}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              variant="destructive"
              className="text-sm font-normal"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
