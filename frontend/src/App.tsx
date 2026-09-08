import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() { return <Routes><Route element={<Layout/>}><Route index element={<HomePage/>}/><Route path="products" element={<ProductsPage/>}/><Route path="products/:id" element={<ProductPage/>}/><Route path="cart" element={<CartPage/>}/><Route path="checkout" element={<CheckoutPage/>}/><Route path="orders" element={<OrdersPage/>}/><Route path="orders/:id/confirmation" element={<ConfirmationPage/>}/><Route path="*" element={<NotFoundPage/>}/></Route></Routes>; }
