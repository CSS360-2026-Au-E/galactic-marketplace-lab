import type { Totals } from "../types";
import { money } from "../utils/money";

export function OrderSummary({ totals }: { totals: Totals }) { return <div className="summary-lines"><div><span>Subtotal</span><b>{money(totals.subtotal)}</b></div><div><span>Shipping</span><b>{totals.shipping ? money(totals.shipping) : "FREE"}</b></div>{totals.discount > 0 && <div className="discount"><span>Discount {totals.coupon && `(${totals.coupon})`}</span><b>−{money(totals.discount)}</b></div>}<div><span>Estimated tax</span><b>{money(totals.tax)}</b></div><div className="grand-total"><span>Total</span><b>{money(totals.total)}</b></div></div>; }
