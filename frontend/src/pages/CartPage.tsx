import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OrderSummary } from "../components/OrderSummary";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import type { Totals } from "../types";
import { baseTotals, money } from "../utils/money";

export function CartPage() {
  const { items, subtotal, update, remove } = useCart(); const [code, setCode] = useState(""); const [message, setMessage] = useState(""); const [couponTotals, setCouponTotals] = useState<Totals | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { setCouponTotals(null); setMessage(""); sessionStorage.removeItem("galactic-coupon"); sessionStorage.removeItem("galactic-totals"); }, [subtotal]);
  const totals = couponTotals ?? baseTotals(subtotal);
  const applyCoupon = async () => { setBusy(true); setMessage(""); try { const result = await api.coupon(code, subtotal); setCouponTotals(result.totals); setMessage(result.message); sessionStorage.setItem("galactic-coupon", result.totals.coupon ?? ""); sessionStorage.setItem("galactic-totals", JSON.stringify(result.totals)); } catch (e) { setCouponTotals(null); sessionStorage.removeItem("galactic-coupon"); sessionStorage.removeItem("galactic-totals"); setMessage((e as Error).message); } finally { setBusy(false); } };
  if (!items.length) return <div className="wrap page empty"><span>🛒</span><h1>Your cargo hold is empty</h1><p>Gary cannot ship you absolutely nothing. Legal was very clear.</p><Link to="/products" className="button primary">Find something peculiar</Link></div>;
  return <div className="wrap page"><div className="catalog-head"><span className="kicker">Cargo manifest</span><h1>Your shopping cart</h1><p>{items.length} unique questionable {items.length === 1 ? "object" : "objects"}</p></div><div className="cart-layout"><section className="cart-items">{items.map(({ product, quantity }) => <article className="cart-item" key={product.id}><Link to={`/products/${product.id}`} className="cart-art">{product.image_url}</Link><div><small>{product.category}</small><Link to={`/products/${product.id}`}><h3>{product.name}</h3></Link><span className="unit-price">{money(product.price)} each</span></div><label>Qty<input type="number" aria-label={`Quantity for ${product.name}`} min="1" max={product.inventory} value={quantity} onChange={(e) => update(product.id, Number(e.target.value))}/><small>Max {product.inventory}</small></label><strong>{money(product.price * quantity)}</strong><button className="remove" onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`}>×</button></article>)}</section>
    <aside className="order-summary"><h2>Order summary</h2><OrderSummary totals={totals}/><div className="coupon"><label htmlFor="coupon">Transmission code</label><div><input id="coupon" placeholder="Try EARTHLING10" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}/><button disabled={!code || busy} onClick={applyCoupon}>{busy ? "…" : "Apply"}</button></div>{message && <small className={couponTotals ? "success" : "form-error"}>{message}</small>}<p>Known codes: EARTHLING10, GARY5, FREESHIP</p></div><Link to="/checkout" className="button primary wide">Proceed to checkout →</Link><small className="secure">🔒 Checkout secured by extremely advanced blinking lights</small></aside></div></div>;
}
