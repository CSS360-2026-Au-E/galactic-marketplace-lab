import { Router } from "express";
import { getProduct, listCategories, listProducts, listReviews } from "../controllers/products.js";
import { validateCoupon } from "../controllers/coupons.js";
import { createOrder, getOrder, listOrders } from "../controllers/orders.js";

export const api = Router();
api.get("/health", (_req, res) => res.json({ status: "ok", message: "Gary is awake." }));
api.get("/products", listProducts);
api.get("/products/:id", getProduct);
api.get("/categories", listCategories);
api.get("/products/:id/reviews", listReviews);
api.post("/coupons/validate", validateCoupon);
api.post("/orders", createOrder);
api.get("/orders", listOrders);
api.get("/orders/:id", getOrder);
