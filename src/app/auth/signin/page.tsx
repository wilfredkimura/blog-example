"use client";
import { signIn } from "next-auth/react";
import { useState, type FormEvent, type ChangeEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const params = useSearchParams();

  // Show OAuth errors that are appended as ?error=...
  useEffect(() => {
    const e = params.get("error");
    if (!e) return;
    const map: Record<string, string> = {
      OAuthSignin: "There was a problem initiating the sign-in. Please try again.",
      OAuthCallback: "The provider rejected the sign-in. Check app settings.",
      OAuthCreateAccount: "Could not create your account via the provider.",
      EmailCreateAccount: "Could not create your email account.",
      CallbackRouteError: "Callback handling error.",
      OAuthAccountNotLinked: "This email is already used with a different login method. Sign in with that method.",
      CredentialsSignin: "Invalid email or password.",
      AccessDenied: "Access denied.",
      Configuration: "Auth is misconfigured. Check environment variables and provider settings.",
      Default: "Sign-in failed. Please try again.",
    };
    setErr(map[e] || map.Default);
  }, [params]);

  async function onSubmit(e: FormEvent) {
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
      <p className="mt-2 text-sm text-foreground/80">Use email + password or continue with a social provider.</p>
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
        <button className="btn-accent px-4 py-2 rounded-md font-semibold w-full" type="submit">Sign in</button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
      <p className="mt-3 text-sm">
        No account? <a className="underline" href="/auth/signup">Create one</a>
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <button onClick={() => signIn("twitter", { callbackUrl: "/" })} className="btn-accent px-4 py-2 rounded-md font-semibold">Continue with X / Twitter</button>
        <button onClick={() => signIn("google", { callbackUrl: "/" })} className="px-4 py-2 rounded-md border font-semibold">Continue with Google</button>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  );
}
