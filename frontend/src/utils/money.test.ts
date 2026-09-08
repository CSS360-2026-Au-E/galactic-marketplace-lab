import { describe, expect, it } from "vitest";
import { baseTotals } from "./money";

describe("baseTotals", () => {
  it("calculates standard shipping and tax", () => expect(baseTotals(20)).toEqual({ subtotal: 20, shipping: 8.99, tax: 1.65, discount: 0, total: 30.64, coupon: null }));
  it("does not charge shipping for an empty cart", () => expect(baseTotals(0).total).toBe(0));
  it("provides free shipping at $100", () => expect(baseTotals(100).shipping).toBe(0));
});
