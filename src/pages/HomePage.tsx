import { Link } from "react-router-dom";
import FeatureCard from "../components/ui/FeatureCard";
import MotifCard from "../components/ui/MotifCard";
import SectionHeader from "../components/ui/SectionHeader";
import { featuredMotifs } from "../data/batikMotifs";

const features = [
  {
    label: "AI",
    title: "Scan Batik",
    description: "Unggah gambar batik dan dapatkan informasi motif, asal daerah, serta cerita budaya di baliknya.",
  },
  {
    label: "FI",
    title: "Filosofi Batik",
    description: "Pelajari makna di balik motif, asal daerah, dan nilai budaya yang melekat pada setiap pola.",
  },
  {
    label: "GA",
    title: "Galeri Motif",
    description: "Jelajahi katalog motif Nusantara dari Parang, Kawung, Megamendung, Sogan, dan lainnya.",
  },
  {
    label: "WB",
    title: "Warisan Budaya",
    description: "BatikVision dirancang sebagai jembatan antara teknologi modern dan pelestarian budaya.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section
        className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-heritage-ink"
        aria-labelledby="hero-title"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-batik.jpg')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-heritage-ink via-heritage-ink/82 to-heritage-ink/28" />
        <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center px-5 py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-heritage-gold">
              Cultural intelligence for Indonesian batik
            </p>
            <h1
              id="hero-title"
              className="mt-5 font-display text-5xl font-bold leading-[0.98] tracking-normal text-heritage-ivory md:text-7xl"
            >
              Kenali Motif Batik Nusantara
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-soga-100">
              BatikVision membantu mengenali motif batik dari gambar, menampilkan asal daerah,
              tingkat kecocokan AI, dan filosofi budaya di baliknya.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/scan"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-heritage-gold px-6 text-sm font-black text-heritage-ink shadow-soft transition hover:-translate-y-0.5 hover:bg-soga-300"
              >
                Scan Batik
              </Link>
              <Link
                to="/galeri"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-soga-100/40 px-6 text-sm font-black text-heritage-ivory transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Lihat Motif
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeader
          eyebrow="Eksplorasi budaya"
          title="Satu ruang untuk mendeteksi, membaca, dan memahami batik."
          description="Antarmuka dibuat bersih agar pengguna bisa fokus pada gambar motif dan cerita budaya, bukan pada dekorasi yang berlebihan."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="border-y border-soga-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Motif pilihan"
              title="Ragam pola yang sering dikenali."
              description="Contoh motif populer untuk edukasi awal sebelum pengguna mencoba fitur deteksi AI."
            />
            <Link
              to="/filosofi"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-soga-300 px-5 text-sm font-bold text-heritage-maroon transition hover:bg-soga-100"
            >
              Pelajari Filosofi
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredMotifs.map((motif) => (
              <MotifCard key={motif.classKey} motif={motif} compact />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
