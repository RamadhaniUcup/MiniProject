import MotifCard from "../components/ui/MotifCard";
import SectionHeader from "../components/ui/SectionHeader";
import { batikMotifs } from "../data/batikMotifs";

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <SectionHeader
        eyebrow="Galeri motif"
        title="Kumpulan motif batik dalam dataset BatikVision."
        description="Setiap card berisi nama motif, asal daerah, dan ringkasan karakter visualnya untuk membantu proses belajar."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {batikMotifs.map((motif) => (
          <MotifCard key={motif.classKey} motif={motif} />
        ))}
      </div>
    </main>
  );
}
