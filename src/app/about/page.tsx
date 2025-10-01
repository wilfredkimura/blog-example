export const metadata = {
  title: "About • LUCAS KIMANTHI",
  description: "About Lucas Kimanthi and the mission behind this platform.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">About</h1>
      <p className="mt-4 text-foreground/80">
        This is the official website of <strong>Lucas Kimanthi</strong>. Here you’ll find commentary, analysis, and
        updates on society, governance, and human rights, with a focus on Kenya and the wider region. The goal is to
        inform, challenge, and contribute to constructive public discourse.
      </p>
      <h2 className="mt-8 text-xl font-semibold">What to Expect</h2>
      <ul className="list-disc ml-6 mt-2 space-y-1 text-foreground/80">
        <li>Evidence-led perspectives and reporting</li>
        <li>Respectful, moderated conversations</li>
        <li>Attention to underrepresented communities and issues</li>
      </ul>
    </main>
  );
}
