export type Product = {
  id: number; name: string; description: string; category: string; price: number;
  inventory: number; image_url: string; badge: string | null;
};

export type CartInput = { productId: number; quantity: number };
export type Totals = { subtotal: number; shipping: number; tax: number; discount: number; total: number; coupon: string | null };
