import SectionHeader from "../components/ui/SectionHeader";
import { batikMotifs } from "../data/batikMotifs";

export default function PhilosophyPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
      <SectionHeader
        eyebrow="Filosofi"
        title="Makna motif batik sebagai pengetahuan budaya."
        description="Batik bukan hanya pola dekoratif. Banyak motif membawa nilai, doa, serta cara pandang masyarakat pembuatnya."
      />

      <div className="mt-10 divide-y divide-soga-200 rounded-lg border border-soga-200 bg-white shadow-sm">
        {batikMotifs.map((motif) => (
          <article key={motif.classKey} className="grid gap-4 p-6 md:grid-cols-[220px_1fr] md:p-7">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-heritage-gold">{motif.origin}</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-heritage-ink">{motif.title}</h2>
            </div>
            <p className="text-base leading-8 text-soga-700">{motif.philosophy}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
