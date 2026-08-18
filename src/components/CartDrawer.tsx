import { useState } from "react";
import { Minus, Plus, Trash2, X, MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatARS, unitPriceFor } from "@/lib/format";
import { productEmoji } from "@/lib/emoji";
import { trpc } from "@/providers/trpc";
import type { SettingsMap } from "@contracts/types";
import { WHATSAPP_NUMBER_FALLBACK } from "@contracts/types";

export function CartDrawer() {
  const { items, setQty, remove, clear, total, open, setOpen } = useCart();
  const { data: settingsRaw } = trpc.catalog.settings.useQuery();
  const settings = (settingsRaw ?? {}) as SettingsMap;
  const wa = String(settings.whatsapp || WHATSAPP_NUMBER_FALLBACK);

  const [form, setForm] = useState({
    nombre: "",
    negocio: "",
    direccion: "",
    zona: "",
    entrega: "retiro" as "retiro" | "envio",
    notas: "",
  });

  if (!open) return null;

  const buildMessage = () => {
    const lines: string[] = ["*NUEVO PEDIDO — EL REY DEL PAN*", ""];
    for (const i of items) {
      const unit = unitPriceFor(i.qty, i.tiers);
      lines.push(`• ${i.qty}x ${i.name}${i.unit ? ` (${i.unit})` : ""} — ${formatARS(unit)} c/u = ${formatARS(unit * i.qty)}`);
    }
    lines.push("", `*TOTAL: ${formatARS(total)}*`, "");
    lines.push(`*Nombre:* ${form.nombre}`);
    if (form.negocio) lines.push(`*Negocio:* ${form.negocio}`);
    lines.push(`*Entrega:* ${form.entrega === "envio" ? "Envío a domicilio" : "Retiro en el local"}`);
    if (form.direccion) lines.push(`*Dirección:* ${form.direccion}`);
    if (form.zona) lines.push(`*Zona:* ${form.zona}`);
    if (form.notas) lines.push(`*Notas:* ${form.notas}`);
    return lines.join("\n");
  };

  const canSend = items.length > 0 && form.nombre.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display text-2xl font-bold uppercase flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-lima" /> Tu pedido
          </h2>
          <button onClick={() => setOpen(false)} className="p-2 hover:text-lima" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && (
            <p className="text-muted-foreground text-center py-10">
              El carrito está vacío. Agregá productos desde el catálogo.
            </p>
          )}
          {items.map((i) => {
            const unit = unitPriceFor(i.qty, i.tiers);
            return (
              <div key={i.productId} className="flex gap-3 bg-secondary/50 border border-border rounded-xl p-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                  {i.imageUrl ? (
                    <img src={i.imageUrl} alt={i.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">{productEmoji(i.name)}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{i.name}</p>
                  <p className="text-lima text-sm font-bold">
                    {formatARS(unit)} <span className="text-muted-foreground font-normal">c/u</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center border border-border rounded-full">
                      <button className="p-1.5 hover:text-lima" onClick={() => setQty(i.productId, i.qty - 1)} aria-label="Restar">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={i.qty}
                        onChange={(e) => setQty(i.productId, Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                        className="w-12 text-center bg-transparent outline-none text-sm font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button className="p-1.5 hover:text-lima" onClick={() => setQty(i.productId, i.qty + 1)} aria-label="Sumar">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(i.productId)}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="ml-auto text-sm font-bold">{formatARS(unit * i.qty)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Nombre *"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-lima col-span-2"
              />
              <input
                placeholder="Negocio"
                value={form.negocio}
                onChange={(e) => setForm({ ...form, negocio: e.target.value })}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-lima"
              />
              <input
                placeholder="Zona / Localidad"
                value={form.zona}
                onChange={(e) => setForm({ ...form, zona: e.target.value })}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-lima"
              />
              <input
                placeholder="Dirección"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-lima col-span-2"
              />
              <div className="col-span-2 flex gap-2">
                {(["retiro", "envio"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setForm({ ...form, entrega: opt })}
                    className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition ${
                      form.entrega === opt ? "bg-lima text-carbon border-lima" : "border-border text-muted-foreground"
                    }`}
                  >
                    {opt === "retiro" ? "Retiro en local" : "Envío a domicilio"}
                  </button>
                ))}
              </div>
              <input
                placeholder="Notas (opcional)"
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-lima col-span-2"
              />
            </div>

            <div className="flex items-center justify-between font-display text-xl">
              <span className="uppercase text-muted-foreground text-base">Total</span>
              <span className="text-lima font-bold">{formatARS(total)}</span>
            </div>

            <a
              href={canSend ? `https://wa.me/${wa}?text=${encodeURIComponent(buildMessage())}` : undefined}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!canSend) e.preventDefault();
                else clear();
              }}
              className={`flex items-center justify-center gap-2 w-full font-bold py-3 rounded-full uppercase text-sm tracking-wide transition ${
                canSend ? "bg-[#25D366] text-carbon hover:brightness-110" : "bg-secondary text-muted-foreground cursor-not-allowed"
              }`}
            >
              <MessageCircle className="w-5 h-5" /> Finalizar pedido por WhatsApp
            </a>
            <p className="text-xs text-muted-foreground text-center">
              Los precios son estimados según la lista vigente. Se confirman al cerrar el pedido.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
