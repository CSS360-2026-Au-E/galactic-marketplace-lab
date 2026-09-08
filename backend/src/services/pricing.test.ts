import { describe, expect, it } from "vitest";
import { calculateTotals } from "./pricing.js";

describe("calculateTotals", () => {
  it("applies percentage coupons", () => expect(calculateTotals(100, "EARTHLING10")).toEqual({ subtotal: 100, shipping: 0, tax: 7.43, discount: 10, total: 97.43, coupon: "EARTHLING10" }));
  it("never discounts merchandise below zero", () => expect(calculateTotals(3, "GARY5")).toMatchObject({ discount: 3, tax: 0, total: 8.99 }));
  it("requires $50 for free shipping", () => expect(calculateTotals(49, "FREESHIP").shipping).toBe(8.99));
  it("enables free shipping at $50", () => expect(calculateTotals(50, "FREESHIP").shipping).toBe(0));
});
