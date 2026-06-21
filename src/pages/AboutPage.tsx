import { Link } from "react-router-dom";
import SectionHeader from "../components/ui/SectionHeader";

export default function AboutPage() {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <SectionHeader
            eyebrow="Tentang BatikVision"
            title="Teknologi yang membantu budaya tetap mudah dikenali."
            description="BatikVision adalah aplikasi edukasi berbasis AI untuk mengenali motif batik Indonesia dari gambar yang diunggah pengguna."
          />
          <div className="mt-8 space-y-5 text-base leading-8 text-soga-700">
            <p>
              Proyek ini menghadirkan pengalaman web modern untuk membantu mengenali motif batik dari
              gambar dan menyajikan informasi budaya yang mudah dipahami.
            </p>
            <p>
              Tujuannya sederhana: membantu pelajar, pengunjung museum, pelaku UMKM, dan masyarakat umum
              mengenal motif batik secara lebih cepat tanpa mengurangi rasa hormat pada proses budaya di
              baliknya.
            </p>
          </div>
          <Link
            to="/scan"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-heritage-maroon px-6 text-sm font-black text-heritage-ivory shadow-soft transition hover:-translate-y-0.5 hover:bg-soga-600"
          >
            Scan Batik
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-soga-200 bg-white shadow-soft">
          <img className="h-full min-h-[420px] w-full object-cover" src="/images/hero-batik.jpg" alt="Visual budaya batik" />
        </div>
      </section>
    </main>
  );
}
