"use client";
import { useState } from "react";

export default function SubscriptionForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setStatus("Subscribed! Check your inbox soon.");
      setEmail("");
    } catch (err: any) {
      setStatus(err.message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-lg mx-auto">
      <label htmlFor="email" className="block text-sm font-medium mb-2">
        Subscribe for updates
      </label>
      <div className="flex items-center gap-2">
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground"
        />
        <button type="submit" className="btn-accent px-4 py-2 rounded-md font-semibold">
          Subscribe
        </button>
      </div>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </form>
  );
}
