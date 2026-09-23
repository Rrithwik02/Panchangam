"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export function NavAuth() {
  const { user, isLoading, plan, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isLoading) {
    return <div className="h-9 w-20 rounded-full bg-card-muted/60" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href="/login"
          className="rounded-full px-3 py-2 text-xs font-semibold text-muted transition-colors hover:text-foreground"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-accent-hover"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card-muted/70 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-foreground/20"
      >
        <UserRound className="h-3.5 w-3.5 text-accent" />
        Account
        {plan === "pro" && (
          <span className="rounded-full bg-accent/15 px-1.5 text-[10px] font-bold uppercase text-accent">Pro</span>
        )}
        <ChevronDown className="h-3 w-3 text-muted" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-md"
        >
          <p className="truncate px-3.5 py-2 text-xs text-muted">{user.email}</p>
          <MenuLink href="/account" onSelect={() => setOpen(false)}>
            Account
          </MenuLink>
          <MenuLink href="/account/subscription" onSelect={() => setOpen(false)}>
            Subscription
          </MenuLink>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            className="block w-full border-t border-border/70 px-3.5 py-2 text-left text-sm text-foreground hover:bg-card-muted"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, onSelect, children }: { href: string; onSelect: () => void; children: React.ReactNode }) {
  return (
    <Link href={href} role="menuitem" onClick={onSelect} className="block px-3.5 py-2 text-sm text-foreground hover:bg-card-muted">
      {children}
    </Link>
  );
}
