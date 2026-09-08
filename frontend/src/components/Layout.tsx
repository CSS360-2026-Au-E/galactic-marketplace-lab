import { NavLink, Outlet } from "react-router-dom";
import { useCart } from "../context/CartContext";

export function Layout() {
  const { count } = useCart();
  return <div className="app-shell">
    <header className="site-header"><NavLink to="/" className="brand"><span className="brand-mark">G</span><span>Galactic <b>Marketplace</b></span></NavLink>
      <nav aria-label="Main navigation"><NavLink to="/products">Shop</NavLink><NavLink to="/orders">Orders</NavLink><NavLink to="/cart" className="cart-link">Cart <span aria-label={`${count} items`}>{count}</span></NavLink></nav>
    </header>
    <main><Outlet /></main>
    <footer><div><b>Galactic Marketplace</b><p>Products for Humans™ and Other Carbon-Based Customers</p></div><div className="footer-note">Serving most known galaxies since last Tuesday.<br/>No asteroids were harmed in this website.</div></footer>
  </div>;
}
