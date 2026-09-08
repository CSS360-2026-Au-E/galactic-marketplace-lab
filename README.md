# Galactic Marketplace

A stable workshop baseline for a silly intergalactic shop. It uses React, Vite, TypeScript, Express, REST, and PostgreSQL. Gary the alien takes no real payments.

## What is included

- A responsive storefront, search, category filters, and price sorting
- Product details and seeded customer reviews
- A local cart with inventory-safe quantity controls
- Server-authoritative coupons, totals, checkout, and inventory updates
- Transactional PostgreSQL orders and order history
- 24 seeded products across seven departments

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL 14 or newer, or Docker

## Start locally

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL. With Docker, run `docker compose up -d postgres`.
3. Install dependencies with `npm install`.
4. Start both apps with `npm run dev`.
5. Open <http://localhost:5173>.

The API creates its tables and seeds an empty database automatically at startup. It listens on <http://localhost:3001>; `GET /api/health` is the health check.

If you prefer to initialize the database without starting the server, run `npm run db:setup`.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend and API in watch mode |
| `npm run build` | Type-check and build both workspaces |
| `npm test` | Run calculation/business-rule tests |
| `npm run db:setup` | Create and seed database tables |

## Coupons

- `EARTHLING10`: 10% off
- `GARY5`: $5 off without making a negative total
- `FREESHIP`: free shipping when subtotal is at least $50

Orders recalculate product prices, discounts, tax, and inventory on the server. Checkout locks product rows during the transaction so simultaneous orders cannot oversell inventory.

## Project map

```text
frontend/src/
  components/  context/  hooks/  pages/  services/  styles/  types/  utils/
backend/src/
  controllers/  db/  routes/  services/  types/
```

This separation is deliberate: workshop bugs can later be introduced into UI, state, network, pricing, coupons, database, or responsive styles without collapsing the entire app.
