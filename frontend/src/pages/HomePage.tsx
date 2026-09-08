import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { ErrorMessage, Loading } from "../components/States";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";

const categoryIcons: Record<string, string> = { "Human Essentials": "👤", "Earth Technology": "📟", "Food-ish Items": "🥪", "Space Travel Supplies": "🚀", "Household Objects": "🏠", "Pets & Creatures": "🐾", "Mystery Inventory": "❔" };

export function HomePage() {
  const products = useFetch(() => api.products());
  const categories = useFetch(() => api.categories());
  return <>
    <section className="hero wrap"><div className="hero-copy"><div className="eyebrow">✦ Universe-wide delivery-ish</div><h1>Ordinary Earth stuff.<br/><span>Extraordinary space prices.</span></h1><p>Gary crossed three nebulas to bring you objects humans apparently need. Every item is inspected with at least one eyeball.</p><div className="button-row"><Link to="/products" className="button primary">Browse the cargo →</Link><a href="#gary" className="button secondary">Meet Gary</a></div><div className="trust-row"><span>✓ Probably authentic</span><span>✓ 30-day-ish returns</span><span>✓ Secure space checkout</span></div></div>
      <div className="hero-visual" aria-label="Gary the alien presenting a package"><div className="planet-ring"></div><div className="gary"><i className="antenna left">●</i><i className="antenna right">●</i><div className="gary-face"><span>●</span><span>●</span><b>⌣</b></div><div className="gary-body">G</div></div><div className="float-card one">📦<b>Fast shipping!</b><small>Relatively speaking</small></div><div className="float-card two">★ 4.8<small>dozens of reviews</small></div></div>
    </section>
    <div className="promo-strip"><span>✦</span> TRUSTED BY DOZENS OF CUSTOMERS <span>✦</span> INTERGALACTIC SHIPPING WHERE PHYSICALLY POSSIBLE <span>✦</span> NO PROBES REQUIRED <span>✦</span></div>
    <section className="section wrap"><div className="section-heading"><div><span className="kicker">Browse by department</span><h2>What are you looking for, carbon unit?</h2></div><Link to="/products">View all cargo →</Link></div>
      {categories.loading ? <Loading/> : categories.error ? <ErrorMessage message={categories.error}/> : <div className="category-grid">{categories.data?.map((category) => <Link to={`/products?category=${encodeURIComponent(category)}`} className="category-tile" key={category}><span>{categoryIcons[category] ?? "✦"}</span><b>{category}</b><small>Explore department →</small></Link>)}</div>}
    </section>
    <section className="section wrap"><div className="section-heading"><div><span className="kicker">Gary's handpicked favorites</span><h2>Featured questionable goods</h2></div><Link to="/products">Shop everything →</Link></div>
      {products.loading ? <Loading/> : products.error ? <ErrorMessage message={products.error}/> : <div className="product-grid">{products.data?.slice(0, 4).map((product) => <ProductCard key={product.id} product={product}/>)}</div>}
    </section>
    <section id="gary" className="gary-story wrap"><div className="gary-avatar">👽</div><div><span className="kicker">A message from management</span><h2>Hi! Gary here.</h2><p>After observing Earth from a respectful and legally acceptable distance, I realized the universe needed better access to chairs, potatoes, and tiny objects that beep. My qualifications include enthusiasm and owning this vest.</p><p className="signature">Gary <small>Founder, CEO & Licensed Spaceship Driver*</small></p></div><aside><b>Gary's Guarantee</b><p>If your item arrives in the wrong dimension, contact support before attempting retrieval.</p><small>*License validity currently under review.</small></aside></section>
  </>;
}
