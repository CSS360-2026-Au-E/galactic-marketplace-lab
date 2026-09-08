import type { Request, Response } from "express";
import { z } from "zod";
import { calculateTotals, COUPONS } from "../services/pricing.js";

const requestSchema = z.object({ code: z.string().trim().min(1), subtotal: z.number().nonnegative(), previousDiscount: z.number().default(0) });

export function validateCoupon(req: Request, res: Response) {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "A coupon code and valid subtotal are required." });
  const code = parsed.data.code.trim().toUpperCase();
  const description = COUPONS[code as keyof typeof COUPONS] ?? "10% intergalactic courtesy discount";
  res.json({ message: `${code} applied: ${description}`, totals: calculateTotals(parsed.data.subtotal, code, parsed.data.previousDiscount) });
}
