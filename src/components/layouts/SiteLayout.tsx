import { Link, Outlet } from "react-router-dom";

const JAVANESE_BATIK = "\uA9A7\uA9A0\uA9B6\uA98F\uA9C0";
const JAVANESE_JAWA = "\uA997\uA9AE";
const JAVANESE_NUSANTARA = "\uA9A4\uA9B8\uA9B1\uA9A4\uA9C0\uA9A0\uA9AB";

export default function SiteLayout() {
  return (
    <div
      className="min-h-screen bg-soga-50 bg-[length:460px_auto] bg-fixed font-body text-heritage-ink"
      style={{
        backgroundImage:
          "linear-gradient(rgba(251, 246, 238, 0.94), rgba(251, 246, 238, 0.98)), url('/images/batik-texture.jpg')",
      }}
    >
      <header className="sticky top-0 z-50 border-b border-soga-200/80 bg-heritage-ivory/95 shadow-[0_10px_30px_rgba(59,33,27,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <Link to="/scan" className="flex items-center gap-3" aria-label="BatikVision">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-heritage-gold bg-heritage-ink text-sm font-black text-heritage-ivory shadow-sm">
              BV
            </span>
            <span>
              <span className="block font-display text-xl font-bold tracking-normal text-heritage-ink">
                BatikVision
              </span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-soga-500 sm:block">
                {JAVANESE_BATIK} {JAVANESE_JAWA}
              </span>
            </span>
          </Link>

          <Link
            to="/scan"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-heritage-maroon px-5 text-sm font-bold text-heritage-ivory shadow-[0_16px_34px_rgba(92,32,36,0.18)] transition hover:-translate-y-0.5 hover:bg-soga-600"
          >
            Scan Batik
          </Link>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-soga-200/80 bg-heritage-ivory">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-soga-700 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>BatikVision mengenalkan motif batik dengan pendekatan yang bersih, hangat, dan mudah dipahami.</p>
          <p className="font-display text-base text-soga-500">{JAVANESE_NUSANTARA}</p>
        </div>
      </footer>
    </div>
  );
}
