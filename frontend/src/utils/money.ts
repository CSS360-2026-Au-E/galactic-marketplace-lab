export const money = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

export function baseTotals(subtotal: number) {
  const rounded = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 8.99;
  const tax = rounded(subtotal * 0.0825);
  return { subtotal: rounded(subtotal), shipping, tax, discount: 0, total: rounded(subtotal + shipping + tax), coupon: null };
}
