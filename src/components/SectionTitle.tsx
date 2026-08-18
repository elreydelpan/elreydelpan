export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight">
        {title.split(" ").slice(0, -1).join(" ")}{" "}
        <span className="text-lima">{title.split(" ").slice(-1)}</span>
      </h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-4 mx-auto w-16 h-1 bg-lima rounded-full" />
    </div>
  );
}
