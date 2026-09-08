import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ErrorMessage, Loading } from "../components/States";
import { useCart } from "../context/CartContext";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { money } from "../utils/money";

export function ProductPage() {
  const { id = "" } = useParams(); const { add } = useCart(); const [quantity, setQuantity] = useState(1); const [added, setAdded] = useState(false);
  const product = useFetch(() => api.product(id), [id]); const reviews = useFetch(() => api.reviews(id), [id]);
  if (product.loading) return <div className="wrap page"><Loading/></div>; if (product.error || !product.data) return <div className="wrap page"><ErrorMessage message={product.error || "Product not found"}/></div>;
  const p = product.data;
  const addItem = () => { add(p, quantity); setAdded(true); window.setTimeout(() => setAdded(false), 1800); };
  return <div className="wrap page"><Link to="/products" className="back-link">← Back to all products</Link><div className="detail"><div className="detail-art"><span>{p.image_url}</span>{p.badge && <em>{p.badge}</em>}</div><div className="detail-copy"><small>{p.category}</small><h1>{p.name}</h1><div className="stars">★★★★★ <span>{reviews.data?.length ?? 0} verified-ish review</span></div><p className="detail-description">{p.description}</p><strong className="detail-price">{money(p.price)}</strong><p className={p.inventory ? "stock" : "stock out"}>{p.inventory ? `● In stock — ${p.inventory} remain in this dimension` : "● Temporarily lost in space"}</p><div className="purchase-row"><label>Quantity<input type="number" min="1" max={p.inventory} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(p.inventory, Number(e.target.value))))}/></label><button className="button primary" disabled={!p.inventory} onClick={addItem}>{added ? "Added to cargo! ✓" : "Add to cart"}</button></div><ul className="assurances"><li>🚀 Ships in 2–97 light-days</li><li>↩ 30-day-ish return policy</li><li>🔒 Encrypted by space math</li></ul></div></div>
    <section className="reviews"><span className="kicker">Transmission log</span><h2>Customer reviews</h2>{reviews.loading ? <Loading/> : reviews.error ? <ErrorMessage message={reviews.error}/> : <div className="review-grid">{reviews.data?.map((review) => <article key={review.id}><div className="stars">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</div><p>“{review.comment}”</p><b>{review.reviewer_name}</b><small>Verified carbon-based buyer</small></article>)}</div>}</section>
  </div>;
}
