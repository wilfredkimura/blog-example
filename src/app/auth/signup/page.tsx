"use client";
import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sign up");
      setStatus("Account created. You can sign in now.");
      setEmail("");
      setPassword("");
      setName("");
    } catch (err: any) {
      setStatus(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-24">
      <h1 className="text-2xl font-semibold text-center">Create account</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          name="name"
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          minLength={8}
          required
        />
        <button className="btn-accent px-4 py-2 rounded-md font-semibold w-full" type="submit">Create account</button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
      <p className="mt-3 text-sm text-center">
        Already have an account? <a className="underline" href="/auth/signin">Sign in</a>
      </p>
    </main>
  );
}
