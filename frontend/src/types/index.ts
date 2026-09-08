export type Product = { id: number; name: string; description: string; category: string; price: number; inventory: number; image_url: string; badge: string | null };
export type Review = { id: number; product_id: number; reviewer_name: string; rating: number; comment: string };
export type CartItem = { product: Product; quantity: number };
export type Totals = { subtotal: number; shipping: number; tax: number; discount: number; total: number; coupon: string | null };
export type AppliedCoupon = { code: string; amount: number };
export type OrderItem = { id: number; name: string; quantity: number; unit_price: number; image_url: string };
export type Order = { id: number; customer_name: string; email: string; shipping_planet: string; shipping_address: string; subtotal: number; shipping: number; tax: number; discount: number; total: number; status: string; created_at: string; items: OrderItem[] };
