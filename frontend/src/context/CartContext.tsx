import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "../types";

type CartValue = { items: CartItem[]; count: number; subtotal: number; add: (product: Product, quantity?: number) => void; update: (id: number, quantity: number) => void; remove: (id: number) => void; clear: () => void };
const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("galactic-cart") ?? "[]"); } catch { return []; }
  });
  useEffect(() => localStorage.setItem("galactic-cart", JSON.stringify(items)), [items]);
  const value = useMemo<CartValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    add: (product, quantity = 1) => setItems((current) => {
      if (product.inventory < 1) return current;
      const existing = current.find((item) => item.product.id === product.id);
      const nextQuantity = Math.min(product.inventory, (existing?.quantity ?? 0) + Math.max(1, quantity));
      return existing ? current.map((item) => item.product.id === product.id ? { ...item, quantity: nextQuantity } : item) : [...current, { product, quantity: Math.min(product.inventory, Math.max(1, quantity)) }];
    }),
    update: (id, quantity) => setItems((current) => current.map((item) => item.product.id === id ? { ...item, quantity: Math.max(1, Math.min(item.product.inventory, quantity)) } : item)),
    remove: (id) => setItems((current) => current.filter((item) => item.product.id !== id)),
    clear: () => setItems([])
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("useCart must be inside CartProvider"); return value; }
