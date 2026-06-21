type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export default function SectionHeader({ eyebrow, title, description, align = "left" }: SectionHeaderProps) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-heritage-gold">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-bold leading-tight text-heritage-ink md:text-5xl">
        {title}
      </h2>
      {description ? <p className="mt-4 text-base leading-7 text-soga-700">{description}</p> : null}
    </div>
  );
}
