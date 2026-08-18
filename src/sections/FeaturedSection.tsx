import { trpc } from "@/providers/trpc";
import type { CatalogCategory, ProductDto } from "@contracts/types";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";

export function FeaturedSection() {
  const { data } = trpc.catalog.list.useQuery();
  const catalog = (data ?? []) as CatalogCategory[];
  const featured: ProductDto[] = catalog
    .flatMap((c) => (c.active ? c.products : []))
    .filter((p) => p.featured && p.active)
    .slice(0, 8);

  if (featured.length === 0) return null;

  return (
    <section id="destacados" className="bg-card/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <SectionTitle title="Productos Destacados" subtitle="Los más elegidos por nuestros clientes" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
