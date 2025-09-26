export default function Hero() {
  return (
    <section className="section-secondary w-full">
      <div className="container py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">Unveiling Truth, Advocating Justice</h1>
        <p className="mt-5 text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
          Independent analysis on Kenya's politics and human rights — elections, governance, corruption, police brutality, gender equality, land rights, youth activism, and more.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a href="#subscribe" className="btn-accent px-6 py-3 rounded-full text-sm font-semibold pill">Subscribe</a>
          <a href="https://wa.me/message" target="_blank" rel="noopener" className="px-6 py-3 rounded-full border text-sm font-semibold pill">
            Join WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
