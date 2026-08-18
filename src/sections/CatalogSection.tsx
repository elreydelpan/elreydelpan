import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { CatalogCategory } from "@contracts/types";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";

export function CatalogSection() {
  const { data, isLoading } = trpc.catalog.list.useQuery();
  const catalog = (data ?? []) as CatalogCategory[];
  const visible = catalog.filter((c) => c.active && c.products.some((p) => p.active));

  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible
      .filter((c) => activeCat === null || c.id === activeCat)
      .map((c) => ({
        ...c,
        products: c.products.filter(
          (p) => p.active && (!q || p.name.toLowerCase().includes(q))
        ),
      }))
      .filter((c) => c.products.length > 0);
  }, [visible, activeCat, query]);

  return (
    <section id="productos" className="max-w-7xl mx-auto px-4 py-16">
      <SectionTitle title="Nuestros Productos" subtitle="Elegí, cargá al carrito y pedí por WhatsApp" />

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full bg-card border border-border rounded-full pl-9 pr-4 py-2 text-sm outline-none focus:border-lima"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCat(null)}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition ${
              activeCat === null ? "bg-lima text-carbon border-lima" : "border-border text-muted-foreground hover:border-lima"
            }`}
          >
            Todos
          </button>
          {visible.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition ${
                activeCat === c.id ? "bg-lima text-carbon border-lima" : "border-border text-muted-foreground hover:border-lima"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando productos...</p>}

      {filtered.map((cat) => (
        <div key={cat.id} className="mb-12">
          <h3 className="font-display text-2xl font-semibold uppercase tracking-wide mb-4 border-l-4 border-lima pl-3">
            {cat.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cat.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ))}

      {!isLoading && filtered.length === 0 && (
        <p className="text-muted-foreground text-center py-10">No se encontraron productos.</p>
      )}
    </section>
  );
}
