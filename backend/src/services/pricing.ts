import type { Totals } from "../types/index.js";

export const COUPONS = {
  EARTHLING10: "10% off",
  GARY5: "$5 off",
  FREESHIP: "Free shipping on orders of $50 or more"
} as const;

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateTotals(subtotalInput: number, couponInput?: string): Totals {
  const subtotal = money(Math.max(0, subtotalInput));
  const code = couponInput?.trim().toUpperCase() || null;
  const coupon = code && code in COUPONS ? code : null;
  const baseShipping = subtotal === 0 ? 0 : subtotal >= 100 ? 0 : 8.99;
  let discount = 0;
  let shipping = baseShipping;
  if (coupon === "EARTHLING10") discount = subtotal * 0.1;
  if (coupon === "GARY5") discount = Math.min(5, subtotal);
  if (coupon === "FREESHIP" && subtotal >= 50) shipping = 0;
  discount = money(discount);
  const taxable = Math.max(0, subtotal - discount);
  const tax = money(taxable * 0.0825);
  return { subtotal, shipping: money(shipping), tax, discount, total: money(Math.max(0, taxable + shipping + tax)), coupon };
}
