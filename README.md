# Galactic Marketplace — Agentic AI Debugging Lab

Welcome to the Galactic Marketplace, a deliberately imperfect online shop run by Gary the alien. In this lab, you will explore the application, notice unexpected behavior, and work with an AI coding agent to investigate and fix one problem at a time.

The goal is not just to make the application work. The goal is to practice using an AI agent as a debugging partner: describe what you observe, guide a focused investigation, understand the root cause, review the proposed change, and verify the result yourself.

## What the application does

Galactic Marketplace is a full-stack e-commerce application. You can:

- browse, search, filter, and sort a catalog of 24 unusual products;
- open product pages and submit customer reviews;
- add products to a cart and change quantities;
- apply coupons and view calculated totals;
- complete a pretend checkout;
- view saved orders and updated inventory.

The application has three main parts:

| Part | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React, Vite, and TypeScript | Pages, forms, cart interactions, and the user interface |
| Backend | Express, REST, and TypeScript | Products, reviews, coupons, checkout, and business rules |
| Database | PostgreSQL | Products, inventory, reviews, and orders |

The backend creates its tables and seeds an empty database automatically when it starts.

## What you are supposed to do

Explore the running application like a curious customer. When you observe one specific behavior that seems wrong, work with your agent to investigate it.

For each issue, you should be able to explain:

1. What did you observe?
2. What did the agent inspect, and why?
3. What caused the behavior?
4. What was changed?
5. Why should that change fix the issue?
6. How did you verify the fix?

Do not ask the agent to find every bug, audit the entire repository, or fix everything at once. That skips the most important part of the exercise. Finish and verify one issue before choosing another.

## Start the lab

### Step 0 — Brief your agent

Before investigating the application, say this to your coding agent:

> Read through `AGENT_INSTRUCTIONS.md` file and assist me throughout the lab.

That file explains the lab's collaboration rules. Your agent should teach and explain, stay focused on the behavior you report, and avoid revealing unrelated problems.

### Step 1 — Start PostgreSQL with Docker

Make sure Docker Desktop (or another Docker engine) is running. From the repository root, run:

```bash
docker compose up -d
```

This starts PostgreSQL in the background on port `5435`. To check that the container is running, use:

```bash
docker compose ps
```

If you prefer to see the database logs in the terminal, run `docker compose up` without `-d`, then use a second terminal for the remaining steps.

### Step 2 — Install dependencies

```bash
npm install
```

You need Node.js 20 or newer and npm 10 or newer.

### Step 3 — Start the application

```bash
npm run dev
```

This starts the frontend and API together. Open the local URL printed by Vite in your terminal (normally <http://localhost:5173>). The API normally runs at <http://localhost:3001>, and its health check is <http://localhost:3001/api/health>.

Keep this terminal running while you use the application. Press `Ctrl+C` when you want to stop the development servers.

### Step 4 — Explore before editing code

Try complete customer workflows rather than only looking at the homepage. For example:

- browse different product categories;
- search and change the sort order;
- open a product and interact with it;
- add more than one item to the cart;
- adjust quantities or remove an item;
- try a coupon and inspect the total;
- complete a pretend order and view order history;
- resize the browser and try a smaller screen.

Take notes about what you did, what you expected, and what actually happened. When something looks wrong, make the observation as reproducible as possible.

### Step 5 — Investigate one observation with your agent

A useful first message includes the exact action and result:

> When I [specific action], I expected [expected result], but [actual result] happened. Help me investigate this one issue. Explain what you inspect and the root cause before changing code.

Once the cause is understood, review the smallest proposed fix before asking the agent to apply it. Then repeat the original steps and confirm whether the behavior changed.

## Tips for working with your agent

- Report symptoms, not guesses. “The displayed total changes after checkout” is more useful than “the pricing function is broken.”
- Include exact reproduction steps, visible messages, sample values, and screenshots when useful.
- Ask the agent to explain unfamiliar files, data flow, or terminology in plain language.
- Ask “What evidence supports that conclusion?” if a diagnosis is unclear.
- Read the proposed diff. Make sure it addresses only the issue you are investigating.
- Do not accept “fixed” as verification. Reproduce the original behavior and test an important nearby case.
- If the result is still wrong, tell the agent exactly what changed and continue the same investigation.
- Commit or record a working change before moving to the next issue so that experiments are easy to review.

## Useful debugging checks

When a page does not behave as expected, check more than the visible UI:

- the browser console for frontend errors;
- the browser Network panel for API requests and responses;
- the API terminal for server or database errors;
- the exact URL and query parameters in the browser;
- whether the behavior still occurs after a refresh;
- whether the same steps work with a different product or value.

These observations help you and your agent follow the complete path from user action to frontend state, API request, backend logic, database, response, and rendered result.

## Useful commands

| Command | Purpose |
| --- | --- |
| `docker compose up -d` | Start PostgreSQL in the background |
| `docker compose ps` | Show the database container's status |
| `docker compose logs -f postgres` | Follow PostgreSQL logs |
| `docker compose down` | Stop the lab database container |
| `npm install` | Install frontend and backend dependencies |
| `npm run dev` | Start the frontend and API in watch mode |
| `npm run build` | Type-check and build both applications |
| `npm test` | Run the existing automated tests |
| `npm run db:setup` | Create and seed the database without starting the API |

## Coupon codes

You can use these while exploring checkout behavior:

- `EARTHLING10` — 10% off
- `GARY5` — $5 off
- `FREESHIP` — free shipping when the subtotal is at least $50

Prices, discounts, tax, inventory, and final totals are recalculated by the server during checkout.

## Project map

```text
frontend/src/
  components/   Shared interface components
  context/      Cart state
  hooks/        Reusable React hooks
  pages/        Application screens
  services/     Calls to the backend API
  styles/       Global styling
  types/        Frontend TypeScript types
  utils/        Formatting and helper functions

backend/src/
  controllers/  Request handling and application behavior
  db/           Database connection, schema, and seed data
  routes/       API endpoint definitions
  services/     Business logic
  types/        Backend TypeScript types
```

You do not need to understand every folder before beginning. Let the observed behavior guide which part of the system you inspect.

## Troubleshooting setup

- **`docker compose` cannot connect:** Start Docker Desktop and retry Step 1.
- **Port `5435` is already in use:** Stop the conflicting service or ask your instructor before changing the project configuration.
- **The app cannot reach the database:** Run `docker compose ps`, then inspect `docker compose logs postgres`.
- **A frontend port is already in use:** Vite may select another port; open the exact URL printed in the terminal.
- **Dependencies or types appear missing:** Run `npm install` again from the repository root.
- **You want a clean seeded database:** Ask your instructor first. Database volumes preserve your lab data even after `docker compose down`, and deleting the volume removes that data.

When setup is working, begin with the application—not a repository-wide code search. Observe, investigate, understand, fix, and verify one problem at a time.
