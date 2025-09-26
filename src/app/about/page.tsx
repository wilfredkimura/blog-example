export const metadata = {
  title: "About • Unveiling Truth",
  description: "Mission and team behind independent analysis of Kenya's politics and human rights.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">About</h1>
      <p className="mt-4 text-foreground/80">
        We are an independent collective focused on Kenya’s political environment and human rights movements. We publish
        analysis, opinion pieces, interviews, and reports to amplify underrepresented voices and advocate for justice.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Our Commitment</h2>
      <ul className="list-disc ml-6 mt-2 space-y-1 text-foreground/80">
        <li>Evidence-based reporting</li>
        <li>Moderated, respectful discourse</li>
        <li>Focus on vulnerable and underrepresented communities</li>
      </ul>
    </main>
  );
}
