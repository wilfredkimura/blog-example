"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
    // next-auth handles redirects; if it returns error in URL, show it
    if (res?.error) setErr(res.error);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-foreground/80">Use email + password or a social provider.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 text-left">
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <button className="btn-accent px-4 py-2 rounded-md font-semibold w-full" type="submit">Sign in</button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
      <p className="mt-3 text-sm">
        No account? <a className="underline" href="/auth/signup">Create one</a>
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <button onClick={() => signIn("google", { callbackUrl: "/" })} className="btn-accent px-4 py-2 rounded-md font-semibold">Sign in with Google</button>
        <button onClick={() => signIn("twitter", { callbackUrl: "/" })} className="px-4 py-2 rounded-md border font-semibold">Sign in with Twitter</button>
      </div>
    </main>
  );
}
