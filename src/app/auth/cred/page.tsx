"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CredLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cred/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Invalid credentials");
        setLoading(false);
        return;
      }
      // Success: reload or redirect
      router.push(redirect);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-semibold mb-6">DB Credentials Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-background"
            placeholder="you@example.com"
            required
            autoFocus
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 bg-background"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="btn-accent px-4 py-2 rounded font-semibold disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-xs text-muted-foreground mt-4">
        Tip: This login uses credentials stored in your PostgreSQL via Prisma (user.passwordHash).
      </p>
    </div>
  );
}
