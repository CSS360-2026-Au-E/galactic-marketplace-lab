import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { OrderSummary } from "../components/OrderSummary";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import type { AppliedCoupon, Totals } from "../types";
import { baseTotals, money } from "../utils/money";

export function CartPage() {
  const { items, subtotal, update, remove } = useCart();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [couponTotals, setCouponTotals] = useState<Totals | null>(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem("galactic-totals") ?? "null") as Totals | null;
      return stored?.subtotal === subtotal ? stored : null;
    } catch { return null; }
  });
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>(() => {
    try {
      const storedTotals = JSON.parse(sessionStorage.getItem("galactic-totals") ?? "null") as Totals | null;
      return storedTotals?.subtotal === subtotal ? JSON.parse(sessionStorage.getItem("galactic-applied-coupons") ?? "[]") : [];
    } catch { return []; }
  });
  const [busy, setBusy] = useState(false);
  const previousSubtotal = useRef(subtotal);

  useEffect(() => {
    if (previousSubtotal.current === subtotal) return;
    previousSubtotal.current = subtotal;
    setCouponTotals(null);
    setAppliedCoupons([]);
    setMessage("");
    sessionStorage.removeItem("galactic-coupon");
    sessionStorage.removeItem("galactic-totals");
    sessionStorage.removeItem("galactic-applied-coupons");
  }, [subtotal]);

  const totals = couponTotals ?? baseTotals(subtotal);
  const applyCoupon = async () => {
    setBusy(true);
    setMessage("");
    try {
      const previousTotals = couponTotals ?? baseTotals(subtotal);
      const result = await api.coupon(code, subtotal, previousTotals.discount);
      const discountChange = result.totals.discount - previousTotals.discount;
      const shippingChange = Math.max(0, previousTotals.shipping - result.totals.shipping);
      const amount = discountChange || shippingChange;
      const couponCode = result.totals.coupon ?? code.trim().toUpperCase();
      setCouponTotals(result.totals);
      setAppliedCoupons((current) => {
        const existing = current.find((coupon) => coupon.code === couponCode);
        const next = existing
          ? current.map((coupon) => coupon.code === couponCode ? { ...coupon, amount: coupon.amount + amount } : coupon)
          : [...current, { code: couponCode, amount }];
        sessionStorage.setItem("galactic-applied-coupons", JSON.stringify(next));
        return next;
      });
      setMessage(result.message);
      sessionStorage.setItem("galactic-coupon", couponCode);
      sessionStorage.setItem("galactic-totals", JSON.stringify(result.totals));
    } catch (error) {
      setMessage((error as Error).message);
    } finally { setBusy(false); }
  };

  if (!items.length) return <div className="wrap page empty">
    <span>🛒</span><h1>Your cargo hold is empty</h1>
    <p>Gary cannot ship you absolutely nothing. Legal was very clear.</p>
    <Link to="/products" className="button primary">Find something peculiar</Link>
  </div>;

  return <div className="wrap page">
    <div className="catalog-head"><span className="kicker">Cargo manifest</span><h1>Your shopping cart</h1><p>{items.length} unique questionable {items.length === 1 ? "object" : "objects"}</p></div>
    <div className="cart-layout">
      <section className="cart-items">{items.map(({ product, quantity }) => <article className="cart-item" key={product.id}>
        <Link to={`/products/${product.id}`} className="cart-art">{product.image_url}</Link>
        <div><small>{product.category}</small><Link to={`/products/${product.id}`}><h3>{product.name}</h3></Link><span className="unit-price">{money(product.price)} each</span></div>
        <label>Qty<input type="number" aria-label={`Quantity for ${product.name}`} max={product.inventory} value={quantity} onChange={(event) => update(product.id, Number(event.target.value))}/><small>Max {product.inventory}</small></label>
        <strong>{money(product.price * quantity)}</strong>
        <button className="remove" onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`}>×</button>
      </article>)}</section>
      <aside className="order-summary">
        <h2>Order summary</h2>
        <OrderSummary totals={totals} appliedCoupons={appliedCoupons}/>
        <div className="coupon"><label htmlFor="coupon">Transmission code</label><div><input id="coupon" placeholder="Try EARTHLING10" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())}/><button disabled={!code || busy} onClick={applyCoupon}>{busy ? "…" : "Apply"}</button></div>{message && <small className={couponTotals ? "success" : "form-error"}>{message}</small>}<p>Known codes: EARTHLING10, GARY5, FREESHIP</p></div>
        <Link to="/checkout" className="button primary wide">Proceed to checkout →</Link>
        <small className="secure">🔒 Checkout secured by extremely advanced blinking lights</small>
      </aside>
    </div>
  </div>;
}
