"use client";
import { useSignIn } from "@clerk/nextjs";
import { useState, type FormEvent, type ChangeEvent } from "react";

function SignInContent() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setErr(null);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/";
      } else {
        setErr("Additional steps required to sign in.");
      }
    } catch (e: any) {
      const msg = e?.errors?.[0]?.message || "Invalid email or password.";
      setErr(msg);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-foreground/80">Use your email and password to sign in.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 text-left">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <button disabled={!isLoaded} className="btn-accent px-4 py-2 rounded-md font-semibold w-full" type="submit">Sign in</button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
      <p className="mt-3 text-sm">
        No account? <a className="underline" href="/auth/signup">Create one</a>
      </p>
      {/* Social sign-in removed as requested */}
    </main>
  );
}

export default function SignInPage() {
  return <SignInContent />;
}
