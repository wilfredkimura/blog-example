"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const staticLinks = [
  { href: "/archives", label: "Archives" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/search", label: "Search" },
];

export default function NavBar() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  // Load categories dynamically so newly added items show up automatically
  useEffect(() => {
    let alive = true;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const categoryLinks = categories.map((c) => ({ href: `/category/${slugify(c.name)}`, label: c.name }));
  const links = [{ href: "/", label: "Home" }, ...categoryLinks, ...staticLinks];
  return (
    <nav className="sticky top-0 z-50 w-full bg-[var(--nav-bg)]/90 backdrop-blur border-b">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" className="text-[var(--nav-fg)] font-semibold tracking-tight text-lg">
          Unveiling Truth
        </Link>
        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-[var(--nav-fg)]/90 hover:opacity-80">
              {l.label}
            </Link>
          ))}
          {role === "ADMIN" && (
            <Link href="/admin" className="text-sm text-[var(--nav-fg)]/90 hover:opacity-80">
              Admin
            </Link>
          )}
          <Link href="#subscribe" className="hidden lg:inline-block btn-accent px-4 py-2 rounded-full text-xs font-semibold">
            Subscribe
          </Link>
        </div>
        {/* Right side controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {session?.user?.name && (
            <span className="hidden md:inline text-sm text-[var(--nav-fg)]/90">Welcome, {session.user.name}!</span>
          )}
          {session ? (
            <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden md:inline text-sm text-[var(--nav-fg)]/90 hover:opacity-80">
              Sign out
            </button>
          ) : (
            <button onClick={() => signIn()} className="hidden md:inline text-sm text-[var(--nav-fg)]/90 hover:opacity-80">
              Sign in
            </button>
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
        <div className="md:hidden border-t bg-[var(--nav-bg)] text-[var(--nav-fg)]">
          <div className="container py-4 flex flex-col gap-4">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-base" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {role === "ADMIN" && (
              <Link href="/admin" className="text-base" onClick={() => setOpen(false)}>
                Admin
              </Link>
            )}
            <div className="flex items-center gap-3 pt-2">
              {session?.user?.name && (
                <span className="text-sm">Welcome, {session.user.name}!</span>
              )}
              <Link href="#subscribe" className="btn-accent px-4 py-2 rounded-full text-xs font-semibold" onClick={() => setOpen(false)}>
                Subscribe
              </Link>
              {session ? (
                <button onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }} className="text-sm opacity-90 hover:opacity-100">Sign out</button>
              ) : (
                <button onClick={() => { setOpen(false); signIn(); }} className="text-sm opacity-90 hover:opacity-100">Sign in</button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
