import type { MotifInfo } from "../../types/batik";

type MotifCardProps = {
  motif: MotifInfo;
  compact?: boolean;
};

export default function MotifCard({ motif, compact = false }: MotifCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-soga-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-soft">
      <div className={compact ? "h-36 overflow-hidden" : "h-52 overflow-hidden"}>
        <img className="h-full w-full object-cover" src={motif.image} alt={`Ilustrasi ${motif.title}`} />
      </div>
      <div className={compact ? "p-5" : "p-6"}>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-heritage-gold">{motif.origin}</p>
        <h3 className="mt-2 font-display text-2xl font-bold text-heritage-ink">{motif.title}</h3>
        <p className="mt-3 text-sm leading-6 text-soga-700">{motif.description}</p>
      </div>
    </article>
  );
}
