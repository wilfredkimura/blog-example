"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton, useUser, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import logo from "../../logo.jpg";

const staticLinks = [
  { href: "/archives", label: "Archives" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/search", label: "Search" },
];

export default function NavBar() {
  const { user } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [authSource, setAuthSource] = useState<"clerk" | "cred" | null>(null);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let alive = true;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => { if (alive) setCategories(d.categories || []); })
      .catch(() => {});
    // fetch current user role from server
    fetch("/api/me")
      .then((r) => r.ok ? r.json() : { role: null, source: null })
      .then((d) => { if (alive) { setRole(d?.role ?? null); setAuthSource(d?.source ?? null); } })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <nav className="border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src={logo}
            alt="LUCAS KIMANTHI logo"
            width={28}
            height={28}
            className="rounded-sm shadow-sm"
            priority
          />
          <span className="text-[var(--nav-fg)] font-semibold tracking-tight text-lg group-hover:opacity-90">
            LUCAS KIMANTHI
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-3 md:gap-4">
          {staticLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-[var(--nav-fg)]/90 hover:opacity-80">
              {l.label}
            </Link>
          ))}
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${slugify(c.name)}`} className="text-sm text-[var(--nav-fg)]/70 hover:opacity-90">
              {c.name}
            </Link>
          ))}
          {role === "ADMIN" && (
            <>
              <Link href="/admin" className="text-sm text-[var(--nav-fg)]/90 hover:opacity-80">Admin</Link>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">Admin</span>
            </>
          )}
          <Link href="#subscribe" className="btn-accent px-4 py-2 rounded-full text-xs font-semibold">
            Subscribe
          </Link>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {mounted && user?.firstName && (
            <span className="hidden md:inline text-xs md:text-sm text-[var(--nav-fg)]/90 max-w-[160px] truncate" title={`Welcome, ${user.firstName}!`}>
              Welcome, {user.firstName}!
            </span>
          )}
          {/* Clerk controls */}
          <SignedIn>
            <UserButton appearance={{ elements: { userButtonBox: "text-[var(--nav-fg)]" } }} />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden md:inline text-xs md:text-sm text-[var(--nav-fg)]/90 hover:opacity-80">Sign in</button>
            </SignInButton>
          </SignedOut>
          {/* DB credentials controls */}
          {authSource === "cred" ? (
            <button
              className="inline text-xs md:text-sm text-[var(--nav-fg)]/90 hover:opacity-80"
              onClick={async () => { await fetch("/api/cred/logout", { method: "POST" }); window.location.reload(); }}
            >
              Sign out (DB)
            </button>
          ) : (
            <Link href="/auth/cred" className="inline text-xs md:text-sm text-[var(--nav-fg)]/90 hover:opacity-80">
              DB Login
            </Link>
          )}
          {/* Hamburger */}
          <button
            aria-label="Toggle menu"
            className="md:hidden w-9 h-9 rounded-md border flex items-center justify-center text-[var(--nav-fg)]"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-current transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`}></span>
              <span className={`block h-0.5 w-5 bg-current transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`block h-0.5 w-5 bg-current transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t">
          <div className="container py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {staticLinks.map((l) => (
                <Link key={l.href} href={l.href} className="text-base" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
              {categories.map((c) => (
                <Link key={c.id} href={`/category/${slugify(c.name)}`} className="text-base" onClick={() => setOpen(false)}>
                  {c.name}
                </Link>
              ))}
              {role === "ADMIN" && (
                <Link href="/admin" className="text-base" onClick={() => setOpen(false)}>
                  Admin
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              {user?.firstName && <span className="text-sm">Welcome, {user.firstName}!</span>}
              {role === "ADMIN" && (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">Admin</span>
              )}
              <Link href="#subscribe" className="btn-accent px-4 py-2 rounded-full text-xs font-semibold" onClick={() => setOpen(false)}>
                Subscribe
              </Link>
              <SignedIn>
                <UserButton appearance={{ elements: { userButtonBox: "text-[var(--nav-fg)]" } }} />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button onClick={() => setOpen(false)} className="text-sm opacity-90 hover:opacity-100">Sign in</button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
