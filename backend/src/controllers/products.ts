import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

const normalize = (row: Record<string, unknown>) => ({ ...row, price: Number(row.price) });

export async function listProducts(req: Request, res: Response) {
  const values: unknown[] = [];
  const where: string[] = [];
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category : "";
  if (search) { values.push(`%${search}%`); where.push(`name ILIKE $${values.length}`); }
  if (category) { values.push(category); where.push(`category = $${values.length}`); }
  const direction = req.query.sort === "price-desc" ? "DESC" : "ASC";
  const order = req.query.sort ? `price ${direction}, id ASC` : "id ASC";
  const result = await pool.query(`SELECT * FROM products ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY ${order}`, values);
  res.json(result.rows.map(normalize));
}

export async function getProduct(req: Request, res: Response) {
  const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
  if (!result.rowCount) return res.status(404).json({ message: "Product not found in this galaxy." });
  res.json(normalize(result.rows[0]));
}

export async function listCategories(_req: Request, res: Response) {
  const result = await pool.query("SELECT DISTINCT category FROM products ORDER BY category");
  res.json(result.rows.map((row) => row.category));
}

export async function listReviews(req: Request, res: Response) {
  const result = await pool.query("SELECT * FROM reviews WHERE product_id = $1 ORDER BY id DESC", [req.params.id]);
  res.json(result.rows);
}
