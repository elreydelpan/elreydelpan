import { Download } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { CatalogCategory } from "@contracts/types";
import { SectionTitle } from "@/components/SectionTitle";
import { downloadPriceListPDF } from "@/lib/pdf";
import { formatARS } from "@/lib/format";

export function PriceListSection() {
  const { data, isLoading } = trpc.catalog.list.useQuery();
  const catalog = (data ?? []) as CatalogCategory[];
  const visible = catalog.filter((c) => c.active && c.products.some((p) => p.active));

  return (
    <section id="lista-precios" className="bg-card/40 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <SectionTitle title="Lista de Precios" subtitle="Precios mayoristas vigentes por cantidad" />

        <div className="text-center mb-10">
          <button
            onClick={() => downloadPriceListPDF(catalog)}
            disabled={isLoading}
            className="bg-lima text-carbon font-bold px-6 py-3 rounded-full text-sm uppercase tracking-wide hover:brightness-110 transition inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Descargar lista en PDF
          </button>
        </div>

        <div className="space-y-10">
          {visible.map((cat) => {
            const prods = cat.products.filter((p) => p.active);
            const refTiers = [...(prods[0]?.priceTiers ?? [])].sort((a, b) => a.minQty - b.minQty);
            const maxTiers = Math.max(...prods.map((p) => p.priceTiers.length));
            return (
              <div key={cat.id}>
                <h3 className="font-display text-2xl font-semibold uppercase tracking-wide mb-3 border-l-4 border-lima pl-3">
                  {cat.name}
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-carbon text-lima">
                        <th className="text-left px-4 py-3 font-display uppercase tracking-wide">Detalle</th>
                        {Array.from({ length: maxTiers }, (_, i) => (
                          <th key={i} className="px-4 py-3 font-display uppercase tracking-wide text-right whitespace-nowrap">
                            {refTiers[i] ? `x${refTiers[i].minQty}` : "—"}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {prods.map((p, idx) => {
                        const tiers = [...p.priceTiers].sort((a, b) => a.minQty - b.minQty);
                        return (
                          <tr key={p.id} className={idx % 2 === 0 ? "bg-card" : "bg-secondary/40"}>
                            <td className="px-4 py-2.5 font-medium">
                              {p.name}
                              {p.unit && <span className="text-muted-foreground text-xs ml-1">({p.unit})</span>}
                            </td>
                            {Array.from({ length: maxTiers }, (_, i) => (
                              <td key={i} className="px-4 py-2.5 text-right whitespace-nowrap">
                                {tiers[i] ? (
                                  <span className={i === 0 ? "" : "text-lima font-semibold"}>{formatARS(tiers[i].price)}</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
