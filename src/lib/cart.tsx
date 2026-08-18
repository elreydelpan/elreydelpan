import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { unitPriceFor, type PriceTier } from "./format";

export type CartItem = {
  productId: number;
  name: string;
  unit: string | null;
  imageUrl: string | null;
  tiers: PriceTier[];
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "rdp_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const api = useMemo<CartCtx>(() => {
    const add = (item: Omit<CartItem, "qty">, qty = 1) =>
      setItems((prev) => {
        const i = prev.findIndex((p) => p.productId === item.productId);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], qty: next[i].qty + qty, tiers: item.tiers, name: item.name };
          return next;
        }
        return [...prev, { ...item, qty }];
      });
    const setQty = (productId: number, qty: number) =>
      setItems((prev) =>
        qty <= 0
          ? prev.filter((p) => p.productId !== productId)
          : prev.map((p) => (p.productId === productId ? { ...p, qty } : p))
      );
    const remove = (productId: number) =>
      setItems((prev) => prev.filter((p) => p.productId !== productId));
    const clear = () => setItems([]);
    const count = items.reduce((a, i) => a + i.qty, 0);
    const total = items.reduce((a, i) => a + unitPriceFor(i.qty, i.tiers) * i.qty, 0);
    return { items, add, setQty, remove, clear, count, total, open, setOpen };
  }, [items, open]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
