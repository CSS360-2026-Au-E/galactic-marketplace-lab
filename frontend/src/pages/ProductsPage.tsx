import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { ErrorMessage, Loading } from "../components/States";
import { api } from "../services/api";
import type { Product } from "../types";

export function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]); const [categories, setCategories] = useState<string[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const search = params.get("search") ?? ""; const category = params.get("category") ?? ""; const sort = params.get("sort") ?? "";
  useEffect(() => { api.categories().then(setCategories).catch(() => undefined); }, []);
  useEffect(() => { setLoading(true); setError(""); api.products(`?${params.toString()}`).then(setProducts).catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [params]);
  const change = (key: string, value: string) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next, { replace: true }); };
  return <div className="wrap page"><div className="catalog-head"><span className="kicker">Gary's complete inventory</span><h1>Browse all products</h1><p>Objects for every occasion, including several occasions we invented.</p></div>
    <div className="filters"><label className="search-field"><span>⌕</span><input aria-label="Search products" placeholder="Search suspicious cargo…" value={search} onChange={(e) => change("search", e.target.value)}/></label><label>Category<select value={category} onChange={(e) => change("category", e.target.value)}><option value="">All departments</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Sort by<select value={sort} onChange={(e) => change("sort", e.target.value)}><option value="">Gary's order</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label></div>
    <div className="results-line"><b>{products.length} items located</b>{(search || category || sort) && <button className="text-button" onClick={() => setParams({})}>Clear filters</button>}</div>
    {loading ? <Loading/> : error ? <ErrorMessage message={error}/> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <div className="empty"><span>🛸</span><h2>No cargo found</h2><p>Try a less specific Earth word.</p></div>}
  </div>;
}
