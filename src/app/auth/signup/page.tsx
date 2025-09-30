"use client";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setStatus(null);
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });
      // Optionally set first name via update
      if (name) {
        try { await signUp.update({ firstName: name }); } catch {}
      }
      // Prepare email verification (if enabled in Clerk dashboard)
      try {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setStatus("Verification code sent to your email. Please verify.");
      } catch {
        // If verification not required, complete sign-up
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          window.location.href = "/";
        } else {
          setStatus("Account created. You can sign in now.");
        }
      }
    } catch (e: any) {
      const msg = e?.errors?.[0]?.message || "Failed to sign up";
      setStatus(msg);
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
        <button disabled={!isLoaded} className="btn-accent px-4 py-2 rounded-md font-semibold w-full" type="submit">Create account</button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
      <p className="mt-3 text-sm text-center">
        Already have an account? <a className="underline" href="/auth/signin">Sign in</a>
      </p>
    </main>
  );
}
