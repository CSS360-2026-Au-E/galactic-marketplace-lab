import type { Request, Response } from "express";
import { z } from "zod";
import { calculateTotals, COUPONS } from "../services/pricing.js";

const requestSchema = z.object({ code: z.string(), subtotal: z.number().nonnegative() });

export function validateCoupon(req: Request, res: Response) {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "A coupon code and valid subtotal are required." });
  const code = parsed.data.code.trim().toUpperCase();
  if (!(code in COUPONS)) return res.status(404).json({ message: "Gary has never heard of that coupon." });
  if (code === "FREESHIP" && parsed.data.subtotal < 50) return res.status(400).json({ message: "FREESHIP requires a subtotal of at least $50." });
  res.json({ message: `${code} applied: ${COUPONS[code as keyof typeof COUPONS]}`, totals: calculateTotals(parsed.data.subtotal, code) });
}
