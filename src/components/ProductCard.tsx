import { useState } from "react";
import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import type { ProductDto } from "@contracts/types";
import { formatARS, nextTier, unitPriceFor } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { productEmoji } from "@/lib/emoji";

export function ProductCard({ product }: { product: ProductDto }) {
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const tiers = product.priceTiers ?? [];
  const unit = unitPriceFor(qty, tiers);
  const next = nextTier(qty, tiers);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:border-lima/60 transition group">
      <div className="relative aspect-square bg-secondary overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-secondary to-carbon">
            {productEmoji(product.name)}
          </div>
        )}
        {product.featured && (
          <span className="absolute top-2 left-2 bg-lima text-carbon text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" /> Destacado
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold leading-snug">{product.name}</h3>
        {product.unit && <p className="text-xs text-muted-foreground">{product.unit}</p>}

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lima font-bold text-xl">{formatARS(unit)}</span>
            {tiers.length > 1 && qty >= (tiers[1]?.minQty ?? Infinity) && (
              <span className="text-xs text-muted-foreground line-through">
                {formatARS(tiers[0].price)}
              </span>
            )}
          </div>
          {next && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Llevando {next.minQty}+: <span className="text-lima">{formatARS(next.price)}</span> c/u
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center border border-border rounded-full">
              <button
                className="p-2 hover:text-lima disabled:opacity-30"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Restar"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                className="w-14 text-center bg-transparent outline-none text-sm font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Cantidad"
              />
              <button className="p-2 hover:text-lima" onClick={() => setQty((q) => q + 1)} aria-label="Sumar">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => {
                add(
                  {
                    productId: product.id,
                    name: product.name,
                    unit: product.unit,
                    imageUrl: product.imageUrl,
                    tiers,
                  },
                  qty
                );
                setOpen(true);
              }}
              className="flex-1 bg-lima text-carbon font-bold text-sm py-2.5 rounded-full hover:brightness-110 transition flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4" /> Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
