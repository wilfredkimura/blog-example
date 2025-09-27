export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(34,197,94,0.15),transparent_60%),radial-gradient(70%_50%_at_90%_10%,rgba(59,130,246,0.12),transparent_60%),linear-gradient(to_bottom,transparent,transparent)]" aria-hidden="true" />
      {/* Decorative blurred orbs */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" aria-hidden="true" />

      <div className="relative container py-20 md:py-28 text-center">
        <p className="inline-flex items-center gap-2 text-xs md:text-sm px-3 py-1 rounded-full border bg-white/50 dark:bg-black/20 backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          Kenya • Politics • Human Rights
        </p>
        <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Unveiling Truth, Advocating Justice
        </h1>
        <p className="mt-5 text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
          Independent analysis on Kenya's politics and human rights — elections, governance, corruption, police brutality, gender equality, land rights, youth activism, and more.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a href="#subscribe" className="btn-accent px-6 py-3 rounded-full text-sm font-semibold pill shadow">Subscribe</a>
          <a href="https://wa.me/message" target="_blank" rel="noopener" className="px-6 py-3 rounded-full border text-sm font-semibold pill hover:bg-foreground/5">
            Join WhatsApp
          </a>
        </div>
        {/* Trust indicators */}
        <div className="mt-10 flex items-center justify-center gap-6 text-xs md:text-sm text-foreground/70">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Evidence-based</div>
          <div className="hidden sm:flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500" /> Independent</div>
          <div className="hidden md:flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Community-focused</div>
        </div>
      </div>
    </section>
  );
}
