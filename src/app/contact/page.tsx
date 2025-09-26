export const metadata = {
  title: "Contact • Unveiling Truth",
  description: "Get in touch securely via form or email.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-4 text-foreground/80">
        Send us a message via the form below or email <a className="underline" href="mailto:editor@unveilingtruth.ke">editor@unveilingtruth.ke</a>.
      </p>
      <form action="https://formspree.io/f/xbjnpqgr" method="POST" className="mt-6 space-y-3">
        <input name="name" placeholder="Name" className="w-full px-3 py-2 border rounded-md" required />
        <input name="email" type="email" placeholder="Email" className="w-full px-3 py-2 border rounded-md" required />
        <textarea name="message" placeholder="Message" className="w-full px-3 py-2 border rounded-md" rows={6} required />
        <button className="btn-accent px-4 py-2 rounded-md font-semibold">Send</button>
      </form>
      <p className="mt-3 text-xs text-foreground/60">We may enable CAPTCHA and additional spam filtering.</p>
    </main>
  );
}
