import { Link } from "react-router-dom";
import { ErrorMessage, Loading } from "../components/States";
import { useFetch } from "../hooks/useFetch";
import { api } from "../services/api";
import { money } from "../utils/money";

export function OrdersPage() {
  const orders = useFetch(() => api.orders());
  return <div className="wrap page">
    <div className="catalog-head"><span className="kicker">Space logistics archive</span><h1>Order history</h1><p>Every purchase Gary has successfully written down.</p></div>
    {orders.loading ? <Loading/> : orders.error ? <ErrorMessage message={orders.error}/> : !orders.data?.length ? <div className="empty">
      <span>📋</span><h2>No orders yet</h2><p>This clipboard is suspiciously clean.</p><Link to="/products" className="button primary">Begin a paper trail</Link>
    </div> : <div className="orders-list">{orders.data.map((order) => <article className="order-card" key={order.id}>
      <header>
        <div><small>ORDER NUMBER</small><h2>GM-{String(order.id).padStart(5, "0")}</h2></div>
        <div><small>CUSTOMER</small><b className={order.customer_name ? "" : "missing-detail"}>{order.customer_name || "Not provided"}</b></div>
        <div><small>ORDERED</small><b>{new Date(order.created_at).toLocaleDateString()}</b></div>
        <div><small>DESTINATION</small><b>{order.shipping_planet}</b></div>
        <span className="status">● {order.status}</span>
      </header>
      <div className="order-products">{order.items.map((item) => <div key={item.id}><span>{item.image_url}</span><p><b>{item.name}</b><small>Qty {item.quantity} × {money(item.unit_price)}</small></p></div>)}</div>
      <footer><span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span><strong>Total {money(order.total)}</strong></footer>
    </article>)}</div>}
  </div>;
}
