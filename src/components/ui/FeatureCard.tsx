type FeatureCardProps = {
  label: string;
  title: string;
  description: string;
};

export default function FeatureCard({ label, title, description }: FeatureCardProps) {
  return (
    <article className="group rounded-lg border border-soga-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-heritage-gold hover:shadow-soft">
      <span className="mb-8 inline-flex h-10 w-10 items-center justify-center rounded-full bg-soga-100 text-sm font-black text-heritage-maroon">
        {label}
      </span>
      <h3 className="font-display text-2xl font-bold text-heritage-ink">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-soga-700">{description}</p>
    </article>
  );
}
