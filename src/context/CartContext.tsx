import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  roaster: string;
  price: number;
  img: string;
  weight?: string;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string, weight?: string) => void;
  setQty: (id: string, weight: string | undefined, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "roastlab_cart_v1";

const keyOf = (id: string, weight?: string) => `${id}::${weight ?? ""}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const k = keyOf(item.id, item.weight);
      const existing = prev.find((p) => keyOf(p.id, p.weight) === k);
      if (existing) {
        return prev.map((p) => keyOf(p.id, p.weight) === k ? { ...p, qty: p.qty + qty } : p);
      }
      return [...prev, { ...item, qty }];
    });
  };

  const remove: CartCtx["remove"] = (id, weight) => {
    setItems((prev) => prev.filter((p) => keyOf(p.id, p.weight) !== keyOf(id, weight)));
  };

  const setQty: CartCtx["setQty"] = (id, weight, qty) => {
    if (qty <= 0) return remove(id, weight);
    setItems((prev) => prev.map((p) => keyOf(p.id, p.weight) === keyOf(id, weight) ? { ...p, qty } : p));
  };

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Ctx.Provider value={{ items, count, subtotal, add, remove, setQty, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
