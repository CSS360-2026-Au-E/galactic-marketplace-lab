import type { Order, Product, Review, Totals } from "../types";

const API = import.meta.env.VITE_API_URL ?? "/api";
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message ?? "The space network is unavailable.");
  return data;
}

export const api = {
  products: (query = "") => request<Product[]>(`/products${query}`),
  product: (id: string) => request<Product>(`/products/${id}`),
  categories: () => request<string[]>("/categories"),
  reviews: (id: string) => request<Review[]>(`/products/${id}/reviews`),
  createReview: (id: string, body: { reviewerName: string; rating: number; comment: string }) => request<Review>(`/products/${id}/reviews`, { method: "POST", body: JSON.stringify(body) }),
  coupon: (code: string, subtotal: number, previousDiscount = 0) => request<{ message: string; totals: Totals }>("/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal, previousDiscount }) }),
  orders: () => request<Order[]>("/orders"),
  order: (id: string) => request<Order>(`/orders/${id}`),
  checkout: (body: unknown) => request<Order>("/orders", { method: "POST", body: JSON.stringify(body) })
};
