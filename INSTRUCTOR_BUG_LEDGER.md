# Galactic Marketplace — Instructor Bug Ledger

> Instructor-only answer key for the intentionally buggy `lab-buggy` branch. Do not distribute this file to students before the exercise.

## BUG-001 — Any Coupon Is Valid

**Category:** Business Logic / Validation  
**Difficulty:** Medium  
**Severity:** Medium  
**Suggested Points:** 2

### Correct Behavior

Only `EARTHLING10`, `GARY5`, and `FREESHIP` should be accepted. Unknown coupon codes should return a validation error and produce no discount.

### Intentional Bug

Every non-empty coupon code is accepted. Unknown codes receive a 10% discount.

### Files / Functions Modified

- `backend/src/services/pricing.ts` — `calculateTotals`
- `backend/src/controllers/coupons.ts` — `validateCoupon`
- `backend/src/controllers/orders.ts` — `createOrder`

### User-Visible Symptom

Codes such as `BANANA`, `HELLO`, or `asdfghjkl` are reported as accepted and reduce the subtotal by 10%.

### Steps to Reproduce

1. Add any product to the cart.
2. Enter `BANANA` in the coupon field.
3. Select **Apply**.
4. Observe the accepted message and 10% discount.

### Exact Change Introduced

The coupon controller no longer rejects codes missing from `COUPONS`. `calculateTotals` retains every non-empty normalized code and assigns unknown codes `subtotal * 0.1`. Checkout's separate unknown-code rejection was also removed so an ordinary order using the code still succeeds.

### Why This Is Incorrect

Coupon identifiers are authorization-like business data and must be checked against the configured allowlist. Merely requiring non-empty text provides no meaningful validation.

### Ideal Fix

Restore the `code in COUPONS` checks in both validation and checkout, and only pass recognized codes into `calculateTotals`.

### Agent Investigation Hints

Trace `POST /api/coupons/validate` from `CartPage` into the coupon controller and then inspect how `calculateTotals` decides whether a normalized code is valid.

### Interactions With Other Bugs

BUG-002 allows this arbitrary discount to be stacked repeatedly. BUG-015 can make the final persisted total differ from the already-invalid cart total.

---

## BUG-002 — Coupons Can Be Applied Repeatedly

**Category:** State / Business Logic  
**Difficulty:** Easy/Medium  
**Severity:** High  
**Suggested Points:** 3

### Correct Behavior

A cart should permit an applicable coupon only once, and discounts and final totals must be bounded at zero.

### Intentional Bug

Each coupon submission adds a new discount to the current discount. Neither the discount nor the resulting taxable amount and total is capped.

### Files / Functions Modified

- `backend/src/services/pricing.ts` — `calculateTotals`
- `backend/src/controllers/coupons.ts` — `requestSchema`, `validateCoupon`
- `frontend/src/services/api.ts` — `api.coupon`
- `frontend/src/pages/CartPage.tsx` — `applyCoupon`

### User-Visible Symptom

Repeatedly applying `EARTHLING10` increases the discount by another 10% of subtotal each time. After enough applications, tax and the final total become negative, so Gary appears to owe the shopper money.

### Steps to Reproduce

1. Add a product to the cart.
2. Enter `EARTHLING10`.
3. Apply it repeatedly until the total becomes negative (for a $20 subtotal, fifteen applications are sufficient).
4. Observe a discount greater than subtotal and a negative total.

### Exact Change Introduced

The coupon request now accepts `previousDiscount`, the cart sends its current accumulated discount, and `calculateTotals` adds the new discount to that value. The zero floors were removed from taxable value and total.

### Why This Is Incorrect

Client-supplied cumulative discount state is trusted, coupon usage is unlimited, and monetary invariants are not enforced.

### Ideal Fix

Do not accept `previousDiscount` from the client. Track one validated coupon per cart/order on the server and restore non-negative bounds on discounts, taxable amount, and total.

### Agent Investigation Hints

Inspect the repeated request payload in the browser network panel, then trace `previousDiscount` through `api.coupon`, `validateCoupon`, and `calculateTotals`.

### Interactions With Other Bugs

Stacks arbitrary coupons enabled by BUG-001. Repeating GARY5 after BUG-003 increases the price instead. BUG-015 means the negative checkout preview is not necessarily the total stored with the order.

---

## BUG-003 — GARY5 Adds Money Instead of Removing It

**Category:** Business Logic / Calculation  
**Difficulty:** Easy  
**Severity:** Medium  
**Suggested Points:** 1

### Correct Behavior

`GARY5` should subtract up to $5 from the merchandise subtotal without making it negative.

### Intentional Bug

`GARY5` subtracts 5 from the internal `discount` value. Since totals subtract `discount`, this adds $5 to the taxable amount and increases tax as well.

### Files / Functions Modified

- `backend/src/services/pricing.ts` — `calculateTotals`

### User-Visible Symptom

The coupon is accepted, but the total rises by slightly more than $5 because tax is also calculated on the added amount.

### Steps to Reproduce

1. Add merchandise to the cart and note the total.
2. Apply `GARY5` once.
3. Observe that the final total increases rather than decreases.

### Exact Change Introduced

The GARY5 branch uses `discount -= 5` instead of adding a positive, subtotal-bounded $5 discount.

### Why This Is Incorrect

A discount must reduce the taxable merchandise amount. A negative discount acts as a surcharge and violates the advertised coupon semantics.

### Ideal Fix

Use `discount += Math.min(5, Math.max(0, subtotal - discount))` within otherwise corrected single-use coupon handling.

### Agent Investigation Hints

Compare total output before and after GARY5, then inspect the sign of the GARY5 adjustment in `calculateTotals`.

### Interactions With Other Bugs

BUG-002 permits repeated GARY5 submissions, adding another $5 each time. The UI's discount detail row only renders positive discounts, so the unexplained higher total is especially noticeable.

---

## BUG-004 — Free Shipping Threshold Is Reversed

**Category:** Business Logic / Boundary Condition  
**Difficulty:** Medium  
**Severity:** Medium  
**Suggested Points:** 2

### Correct Behavior

`FREESHIP` should remove the $8.99 shipping charge only when merchandise subtotal is at least $50.

### Intentional Bug

The comparison is reversed: the coupon removes shipping below $50 and leaves the charge in place at or above $50.

### Files / Functions Modified

- `backend/src/services/pricing.ts` — `calculateTotals`
- `backend/src/controllers/coupons.ts` — `validateCoupon`
- `backend/src/controllers/orders.ts` — `createOrder`

### User-Visible Symptom

A cheap order receives free shipping, while a $50–$99.99 order displays an accepted FREESHIP message but still costs $8.99 to ship. Standard automatic free shipping at $100 was removed so it cannot mask the reversed coupon behavior.

### Steps to Reproduce

1. Add merchandise totaling less than $50 and apply `FREESHIP`; shipping becomes free.
2. Change the cart to total at least $50 and reapply it.
3. Observe the $8.99 shipping charge remains.

### Exact Change Introduced

The FREESHIP comparison in `calculateTotals` changed from `subtotal >= 50` to `subtotal < 50`. Threshold rejection was removed from both controller paths, and base shipping is now charged for every non-empty order so the wrong high-subtotal result remains visible.

### Why This Is Incorrect

The predicate implements the exact inverse of the advertised eligibility boundary.

### Ideal Fix

Restore `subtotal >= 50` for the shipping waiver and reject or clearly report ineligible coupon attempts below the threshold.

### Agent Investigation Hints

Test values immediately below, at, and above $50, then inspect the FREESHIP branch and its comparison operator.

### Interactions With Other Bugs

BUG-002 allows repeated applications but FREESHIP itself does not accumulate a numeric discount. BUG-015 may make the saved total omit shipping regardless of this result.

---

## BUG-005 — Add to Cart Adds Two

**Category:** Interaction / State  
**Difficulty:** Easy  
**Severity:** Medium  
**Suggested Points:** 1

### Correct Behavior

One click on a product card's “+” control should add one unit.

### Intentional Bug

Each accepted “+” click requests two units while the control and confirmation behavior remain unchanged.

### Files / Functions Modified

- `frontend/src/components/ProductCard.tsx` — `addToCart`

### User-Visible Symptom

The cart count increases by two after one click. After the 10-second checkmark resets, another click adds two more.

### Steps to Reproduce

1. Note the header cart count.
2. Click “+” on any in-stock product card once.
3. Observe the count increases by two.

### Exact Change Introduced

`addToCart` calls `add(product, 2)` instead of relying on the cart context's default quantity of one.

### Why This Is Incorrect

The UI communicates a single add action but mutates the cart by two units.

### Ideal Fix

Call `add(product)` or `add(product, 1)`.

### Agent Investigation Hints

Start at the product card click handler and inspect the quantity argument passed into cart context.

### Interactions With Other Bugs

BUG-007 later permits card additions to exceed stock in some states; BUG-008 can then make cart totals even less intuitive.

---

## BUG-006 — Removing One Product Removes the Wrong Product

**Category:** Interaction / State  
**Difficulty:** Medium  
**Severity:** Medium  
**Suggested Points:** 2

### Correct Behavior

Removing a cart product should remove exactly the item whose control was selected.

### Intentional Bug

In a multi-item cart, removal targets the next array index, wrapping from the last item to the first. Single-item carts still remove normally.

### Files / Functions Modified

- `frontend/src/context/CartContext.tsx` — `remove`

### User-Visible Symptom

Selecting remove beside one item makes a neighboring item disappear instead. The page remains stable.

### Steps to Reproduce

1. Add three distinct products.
2. Open the cart.
3. Remove the middle product.
4. Observe that the following product disappears while the selected one remains.

### Exact Change Introduced

The selected product ID is converted to an index, but the filter removes `(selectedIndex + 1) % current.length` whenever the cart contains multiple products.

### Why This Is Incorrect

The action uses a derived neighboring index rather than the stable product identifier supplied by the clicked control.

### Ideal Fix

Filter directly with `item.product.id !== id`.

### Agent Investigation Hints

Confirm the remove handler receives the correct ID in `CartPage`, then inspect index calculation inside the cart context.

### Interactions With Other Bugs

Independent of quantity and coupon bugs. It may remove a product used to trigger BUG-016, causing that hidden pricing effect to disappear unexpectedly.

---

## BUG-007 — Quantity Can Exceed Inventory

**Category:** State / Business Rule  
**Difficulty:** Medium  
**Severity:** Medium  
**Suggested Points:** 2

### Correct Behavior

Cart quantity must never exceed the product's available inventory.

### Intentional Bug

Manual cart quantity updates no longer apply the inventory ceiling.

### Files / Functions Modified

- `frontend/src/context/CartContext.tsx` — `update`

### User-Visible Symptom

A product with three units remaining can display quantity 15 in the cart and produce totals for all 15 units. Checkout reports the server's stock conflict without crashing the page.

### Steps to Reproduce

1. Add a low-inventory product.
2. In the cart quantity input, type a value greater than the displayed maximum.
3. Move focus away from the field.
4. Observe the excessive quantity and recalculated total remain visible.

### Exact Change Introduced

The `Math.min(item.product.inventory, quantity)` bound was removed from cart context's `update` function. The HTML `max` attribute remains only as non-enforcing UI metadata.

### Why This Is Incorrect

HTML constraints do not sanitize controlled React state; application state must enforce inventory rules independently.

### Ideal Fix

Restore `Math.max(1, Math.min(item.product.inventory, quantity))` and retain the backend stock check as defense in depth.

### Agent Investigation Hints

Inspect the controlled number input's `onChange`, then follow the value into `CartContext.update`.

### Interactions With Other Bugs

BUG-008 further removes the lower bound. BUG-018 removes the backend stock pre-check, so quantities above inventory can also complete checkout; BUG-011 then leaves inventory unchanged.

---

## BUG-008 — Negative or Zero Quantity Accepted

**Category:** Validation / State  
**Difficulty:** Medium  
**Severity:** High  
**Suggested Points:** 2

### Correct Behavior

Cart quantities must be positive integers and must never cause negative merchandise totals.

### Intentional Bug

The cart's manual update path stores the numeric input without any lower-bound validation.

### Files / Functions Modified

- `frontend/src/context/CartContext.tsx` — `update`
- `frontend/src/pages/CartPage.tsx` — cart quantity input

### User-Visible Symptom

Typing `0` or `-3` leaves that value in the cart. Negative line totals, subtotal, tax, and final total can appear. After BUG-020, checkout also accepts the invalid quantity.

### Steps to Reproduce

1. Add a product and open the cart.
2. Replace its quantity with `-3` by typing the value.
3. Observe the negative line price and distorted order summary.

### Exact Change Introduced

`CartContext.update` assigns `quantity` directly instead of applying `Math.max(1, quantity)`, and the cart quantity input omits the `min="1"` constraint.

### Why This Is Incorrect

Negative quantities are not purchasable units and turn multiplication-based totals into credits.

### Ideal Fix

Validate a finite positive integer in context and continue enforcing the same invariant in the API.

### Agent Investigation Hints

Follow the quantity input event into cart state, and compare frontend permissiveness with the positive-integer Zod schema used at checkout.

### Interactions With Other Bugs

Extends BUG-007's missing range validation. BUG-020 removes the corresponding backend quantity validation, allowing the bad state to persist as an order. Negative subtotals still prevent coupon preview because its request schema requires a non-negative subtotal.

---

## BUG-009 — Search Becomes Case Sensitive

**Category:** Interaction / Search Logic  
**Difficulty:** Easy  
**Severity:** Low  
**Suggested Points:** 1

### Correct Behavior

Product-name search should match regardless of letter casing.

### Intentional Bug

The PostgreSQL query uses case-sensitive `LIKE` rather than `ILIKE`.

### Files / Functions Modified

- `backend/src/controllers/products.ts` — `listProducts`

### User-Visible Symptom

Searching `frog` returns no products, while `Frog` finds Emergency Frog.

### Steps to Reproduce

1. Open the product catalog.
2. Search for `frog`; observe zero results.
3. Change it to `Frog`; observe Emergency Frog appears.

### Exact Change Introduced

The search predicate changed from `name ILIKE $n` to `name LIKE $n`.

### Why This Is Incorrect

The UI presents a general product search and users should not need to know title capitalization.

### Ideal Fix

Restore PostgreSQL `ILIKE`, or compare normalized values with a suitable indexed strategy.

### Agent Investigation Hints

Compare network requests for lowercase and title-case queries, then inspect the SQL operator in `listProducts`.

### Interactions With Other Bugs

Independent. BUG-010 affects ordering only after products have matched the search.

---

## BUG-010 — Low-to-High Sort Runs Backward

**Category:** Interaction / Logic  
**Difficulty:** Easy  
**Severity:** Low  
**Suggested Points:** 1

### Correct Behavior

Selecting **Price: low to high** should return products in ascending numeric price order.

### Intentional Bug

The low-to-high option uses descending SQL order. The high-to-low option remains correct.

### Files / Functions Modified

- `backend/src/controllers/products.ts` — `listProducts`

### User-Visible Symptom

Selecting low to high places the most expensive products first.

### Steps to Reproduce

1. Open the product catalog.
2. Select **Price: low to high**.
3. Compare the first few prices and observe they descend.

### Exact Change Introduced

Both branches of the sort-direction ternary return `DESC`, so only the ascending label is false.

### Why This Is Incorrect

The requested sort direction is not translated into the corresponding SQL direction.

### Ideal Fix

Return `ASC` when `sort` is `price-asc` and `DESC` when it is `price-desc`.

### Agent Investigation Hints

Inspect the catalog's `sort` query parameter, then follow it into the SQL `ORDER BY` construction.

### Interactions With Other Bugs

Independent of BUG-009; case-sensitive filtering may reduce the result set before sorting.

---

## BUG-011 — Checkout Does Not Reduce Inventory

**Category:** Database / Persistence / Business Logic  
**Difficulty:** Medium/Hard  
**Severity:** High  
**Suggested Points:** 3

### Correct Behavior

Each successfully purchased quantity should be atomically subtracted from the corresponding product inventory.

### Intentional Bug

Orders and order items are committed normally, but no product inventory update is executed.

### Files / Functions Modified

- `backend/src/controllers/orders.ts` — `createOrder`

### User-Visible Symptom

After purchasing a product, its product page and catalog still show the original stock level.

### Steps to Reproduce

1. Record an in-stock product's inventory.
2. Complete checkout for one or more units.
3. Reopen or refresh the product.
4. Observe that inventory is unchanged.

### Exact Change Introduced

The `UPDATE products SET inventory = inventory - $1 WHERE id = $2` query was removed from the order-item transaction loop.

### Why This Is Incorrect

Persisting a sale without consuming inventory permits repeated sales of the same stock and makes availability data false.

### Ideal Fix

Restore the inventory update inside the existing locked transaction and retain the preceding `FOR UPDATE` availability check.

### Agent Investigation Hints

Trace all SQL statements executed by `createOrder` and look for a write to `products.inventory` after inserting order items.

### Interactions With Other Bugs

BUG-007 can show excessive quantities but the stock pre-check still rejects them. BUG-014 duplicate orders also leave inventory unchanged, making repeated checkout easier to observe.

---

## BUG-012 — Order Item Quantities Are Saved as One

**Category:** Database Persistence  
**Difficulty:** Hard  
**Severity:** High  
**Suggested Points:** 3

### Correct Behavior

Each `order_items.quantity` value should equal the quantity validated and priced during checkout.

### Intentional Bug

Every order-item row stores quantity `1`, regardless of the purchased cart quantity.

### Files / Functions Modified

- `backend/src/controllers/orders.ts` — `createOrder`

### User-Visible Symptom

Checkout can price four units, but confirmation/history later lists quantity one while retaining the larger order-level total.

### Steps to Reproduce

1. Add a product and set its quantity to four.
2. Complete checkout.
3. Open order history.
4. Observe the item says `Qty 1` even though the order total was calculated from four.

### Exact Change Introduced

The order-item INSERT parameter array supplies the literal `1` instead of `item.quantity`.

### Why This Is Incorrect

The persisted line-item facts no longer reconcile with the validated request or order totals.

### Ideal Fix

Pass `item.quantity` as the third INSERT parameter and add an integration assertion that summed line totals match the order subtotal.

### Agent Investigation Hints

Compare the incoming order payload, order-level subtotal, and stored `order_items` row, then inspect INSERT parameter mapping.

### Interactions With Other Bugs

BUG-015 creates a second order-level mismatch. BUG-014 can produce two separate orders whose items are all independently stored as quantity one.

---

## BUG-013 — Shipping Planet Is Always Persisted as Earth

**Category:** Database / Data Mapping  
**Difficulty:** Medium  
**Severity:** Medium  
**Suggested Points:** 2

### Correct Behavior

The order should persist the shipping planet submitted and validated at checkout.

### Intentional Bug

The orders INSERT always receives the literal `Earth` for `shipping_planet`.

### Files / Functions Modified

- `backend/src/controllers/orders.ts` — `createOrder`

### User-Visible Symptom

A shopper enters Mars, Europa, or another destination, but confirmation and order history show Earth.

### Steps to Reproduce

1. Proceed to checkout with a valid cart.
2. Enter `Mars` as the shipping planet.
3. Complete the order.
4. Observe `Earth` as the saved destination.

### Exact Change Introduced

The third value passed to the order INSERT changed from `data.shippingPlanet` to the hard-coded string `Earth`.

### Why This Is Incorrect

Validated user input is discarded during persistence, sending the order to a different destination.

### Ideal Fix

Pass `data.shippingPlanet` to the matching SQL placeholder and add a request-to-record mapping test.

### Agent Investigation Hints

Verify the browser request contains Mars, then inspect the values array paired with the orders INSERT placeholders.

### Interactions With Other Bugs

Independent of calculations. Duplicate orders from BUG-014 will both persist the same incorrect Earth destination.

---

## BUG-014 — Stored Order Total Differs From Checkout Total

**Category:** Database / Calculation  
**Difficulty:** Hard  
**Severity:** High  
**Suggested Points:** 4

### Correct Behavior

The persisted order total should be the exact authoritative `totals.total` calculated for checkout.

### Intentional Bug

The database stores `subtotal + tax` as total, omitting shipping and failing to subtract positive discounts.

### Files / Functions Modified

- `backend/src/controllers/orders.ts` — `createOrder`

### User-Visible Symptom

For an ordinary non-empty order with paid shipping, the confirmation/history total is $8.99 lower than the total displayed at checkout. Coupon orders can differ by both shipping and discount.

### Steps to Reproduce

1. Add an item without applying a coupon.
2. Note the checkout total, including $8.99 shipping.
3. Complete checkout.
4. Compare the confirmation/history total; it omits shipping.

### Exact Change Introduced

The ninth orders INSERT value changed from `totals.total` to `totals.subtotal + totals.tax`. The component columns still store the calculated shipping and discount, making the record internally inconsistent.

### Why This Is Incorrect

Stored aggregate totals must reconcile exactly with their monetary components and the amount shown to the customer.

### Ideal Fix

Persist `totals.total` and add an invariant or integration test asserting `total = subtotal - discount + shipping + tax`.

### Agent Investigation Hints

Compare all monetary columns in an affected order, then inspect the values array used by the orders INSERT.

### Interactions With Other Bugs

Repeated discounts from BUG-002 and GARY5 from BUG-003 widen or invert the discrepancy. BUG-012 independently makes line quantities disagree with subtotal. 

---

## BUG-015 — Three Emergency Frogs Make Another Product Free

**Category:** Hidden Business Logic / Bonus  
**Difficulty:** Hard  
**Severity:** Medium  
**Suggested Points:** 3 bonus

### Correct Behavior

Cart subtotal should equal the sum of every product's unit price multiplied by its quantity unless a documented, validated promotion applies.

### Intentional Bug

When the cart contains exactly three Emergency Frogs, the first non-frog line item in insertion order is silently deducted in full.

### Files / Functions Modified

- `frontend/src/context/CartContext.tsx` — `calculateCartSubtotal`, cart `subtotal`

### User-Visible Symptom

Changing Emergency Frog quantity to exactly three causes another line's full price to disappear from the subtotal. No promotion or explanation appears.

### Steps to Reproduce

1. Add any non-frog product first.
2. Add Emergency Frog and set its cart quantity to exactly three.
3. Compare the visible line totals with subtotal.
4. Observe subtotal excludes the first product completely.

### Exact Change Introduced

Cart subtotal moved into `calculateCartSubtotal`, which detects an exact Emergency Frog quantity of three and subtracts the first non-frog line total from the normal reduction.

### Why This Is Incorrect

An undisclosed client-only promotion makes displayed totals fail to equal their line items and is not reproduced by server pricing.

### Ideal Fix

Remove the product-name special case and calculate subtotal with the plain line-item reduction. Any real promotion should be explicit and server-authoritative.

### Agent Investigation Hints

Sum cart line totals manually, vary frog quantity around two, three, and four, then inspect where cart context derives `subtotal`.

### Interactions With Other Bugs

BUG-005 initially adds two frogs per card click, so use the cart input to reach exactly three. BUG-008 permits that manual edit. Checkout's server-calculated subtotal ignores this secret rule, and BUG-014 then stores yet another total, producing multiple reconciliation clues.

---

## BUG-016 — Stored XSS Through Product Reviews

**Category:** Security / Stored Cross-Site Scripting  
**Difficulty:** Medium  
**Severity:** Critical  
**Suggested Points:** 5

### Correct Behavior

Review comments should be treated as untrusted text. React should escape their markup so HTML is displayed literally and event handlers cannot execute.

### Intentional Bug

Review comments are persisted unchanged and rendered directly as HTML. Browser-executable attributes in a stored review run whenever someone opens the affected product page.

### Files / Functions Modified

- `frontend/src/pages/ProductPage.tsx` — review comment rendering inside `allReviews.map`

### User-Visible Symptom

HTML in a review is interpreted as page markup. An event-handler payload can execute code in the Galactic Marketplace origin for every later visitor to that product.

### Steps to Reproduce

1. Open any product detail page.
2. Submit this harmless proof-of-execution as the review text: `<img src="invalid" onerror="document.body.dataset.workshopXss='true'">`.
3. Inspect the page's `<body>` element and observe `data-workshop-xss="true"`.
4. Refresh the product page and observe that the stored payload executes again.

### Exact Change Introduced

The safe JSX text expression `{review.comment}` was replaced with `<p dangerouslySetInnerHTML={{ __html: review.comment }}/>` without sanitization or an HTML allowlist. The backend intentionally continues storing the original string.

### Why This Is Incorrect

Untrusted stored content is interpreted in the application's origin. An attacker could act as the current user, alter the page, read browser-accessible application data, or send requests on the user's behalf.

### Ideal Fix

Render the comment with the ordinary JSX expression `{review.comment}`. If rich text becomes a real requirement, sanitize it with a rigorously configured allowlist before rendering and enforce a restrictive Content Security Policy as defense in depth.

### Agent Investigation Hints

Trace the review text from `POST /api/products/:id/reviews` through PostgreSQL and inspect how `ProductPage` inserts the returned `comment` into the DOM. Search for `dangerouslySetInnerHTML`.

### Interactions With Other Bugs

Independent of BUG-001 through BUG-015. Unlike the earlier business-logic defects, this bug crosses a security boundary and should be prioritized first during remediation.

---

## BUG-017 — Backend Allows Purchases Above Inventory

**Category:** Backend Business Logic / Inventory Validation  
**Difficulty:** Medium  
**Severity:** High  
**Suggested Points:** 3

### Correct Behavior

Checkout must reject any order item whose requested quantity exceeds the currently locked product inventory, including products with zero stock.

### Intentional Bug

The backend loads and locks product rows but never compares requested quantities with their inventory values before creating the order.

### Files / Functions Modified

- `backend/src/controllers/orders.ts` — `createOrder`

### User-Visible Symptom

A shopper can set Communication Rectangle quantity to 2100 and successfully complete checkout even when only 11 remain.

### Steps to Reproduce

1. Add Communication Rectangle to the cart.
2. Change its quantity to `2100`.
3. Proceed through checkout with valid customer details.
4. Observe that an order is created rather than receiving the stock-conflict message.

### Exact Change Introduced

The comparison `product.inventory < item.quantity` and its HTTP 409 response were removed from the locked product-processing loop. Product existence is still checked, preserving ordinary error handling and database stability.

### Why This Is Incorrect

Client state cannot be trusted to enforce stock. Without a server-side availability invariant, any direct API caller can purchase arbitrary quantities.

### Ideal Fix

Restore the locked-row quantity comparison before calculating totals or inserting the order, and retain an atomic inventory update guarded against negative stock.

### Agent Investigation Hints

Send an oversized quantity directly to `POST /api/orders`, then inspect what validations occur after the `SELECT ... FOR UPDATE` query.

### Interactions With Other Bugs

BUG-007 exposes the oversized quantity through the cart UI. BUG-011 means the oversized purchase does not reduce inventory, and BUG-012 stores the resulting line-item quantity as one even though the order subtotal was calculated from the oversized request.

---

## BUG-018 — Checkout Accepts Missing Customer Details

**Category:** Frontend and Backend Validation  
**Difficulty:** Easy/Medium  
**Severity:** High  
**Suggested Points:** 3

### Correct Behavior

Checkout should require a meaningful customer name, valid email address, shipping planet, shipping address, and selected payment placeholder before creating an order. The API must independently enforce those requirements.

### Intentional Bug

The form has no required, length, or email-format constraints, and the backend accepts either missing keys or empty strings for every customer and checkout-detail field.

### Files / Functions Modified

- `frontend/src/pages/CheckoutPage.tsx` — initial form state and checkout field constraints
- `backend/src/controllers/orders.ts` — `orderSchema`

### User-Visible Symptom

A shopper can leave every customer-detail field blank, choose no payment method, and still receive a successful order confirmation. Direct API callers may omit all five detail fields entirely.

### Steps to Reproduce

1. Add any valid quantity to the cart and open checkout.
2. Leave name, email, planet, address, and payment method blank.
3. Select **Place order**.
4. Observe that the order is created.

### Exact Change Introduced

Frontend `required`, `minLength`, and email input-type validation were removed, defaults were changed to empty strings, and a blank payment option was added. Backend Zod fields are optional, default missing values to empty strings, and check only string type and maximum length when supplied.

### Why This Is Incorrect

The order cannot be associated with or delivered to a customer, and client-side checks alone would not protect the API from direct invalid requests in any case.

### Ideal Fix

Restore browser constraints for feedback and independently restore trimmed minimum lengths plus `z.string().email()` in `orderSchema`.

### Agent Investigation Hints

Inspect the checkout input attributes, then send the same empty-string payload directly to `POST /api/orders` and trace it through `orderSchema`.

### Interactions With Other Bugs

BUG-013 masks an empty submitted planet by persisting Earth. 

---

## BUG-019 — Backend Accepts Negative or Empty Order Items

**Category:** Backend Validation / Business Logic  
**Difficulty:** Medium  
**Severity:** Critical  
**Suggested Points:** 4

### Correct Behavior

An order must contain at least one existing product, and every requested quantity and product ID must be a positive integer.

### Intentional Bug

The API permits omitted or empty item arrays and accepts zero or negative integer quantities and product IDs at schema-validation time.

### Files / Functions Modified

- `backend/src/controllers/orders.ts` — `orderSchema`
- `backend/src/services/pricing.ts` — `calculateTotals`

### User-Visible Symptom

A cart item with quantity `-3` can complete checkout and create an order with a negative subtotal. A direct API request with no `items` property can also create an empty order.

### Steps to Reproduce

1. Add a product and change its cart quantity to `-3`.
2. Complete checkout with any or no customer details.
3. Observe that an order is created with negative monetary values.
4. Alternatively, POST `{}` to `/api/orders` and observe an empty order is created.

### Exact Change Introduced

The item array's `.min(1)` requirement was removed and the field now defaults to an empty array. `productId` and `quantity` changed from positive integers to unrestricted integers. The pricing service's `Math.max(0, subtotalInput)` floor was also removed so negative requested quantities remain visible in order-level monetary values.

### Why This Is Incorrect

Negative quantities turn purchases into credits, while empty orders have no commercial meaning. Both violate core order invariants that must be enforced server-side.

### Ideal Fix

Require `items` with `.min(1)`, validate positive integer product IDs and quantities, reject duplicate product entries, and retain database constraints as defense in depth.

### Agent Investigation Hints

Send negative, zero, and missing item payloads directly to `POST /api/orders`, then inspect the Zod item schema and how subtotal is derived.

### Interactions With Other Bugs

BUG-008 provides the negative-quantity UI path. BUG-012 stores quantity one despite the negative request, avoiding the database's positive-quantity constraint. BUG-015 persists a mismatched negative total, and BUG-018 allows the same order to omit all customer details.
