export type PriceTier = { minQty: number; price: number };

export function formatARS(n: number): string {
  return "$ " + n.toLocaleString("es-AR");
}

/** Precio unitario según cantidad (escala mayorista automática) */
export function unitPriceFor(qty: number, tiers: PriceTier[]): number {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  let price = sorted[0]?.price ?? 0;
  for (const t of sorted) {
    if (qty >= t.minQty) price = t.price;
  }
  return price;
}

/** Próximo descuento disponible (para mostrar "x10 te sale ...") */
export function nextTier(qty: number, tiers: PriceTier[]): PriceTier | null {
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  return sorted.find((t) => t.minQty > qty) ?? null;
}
