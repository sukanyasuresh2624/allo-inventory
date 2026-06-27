# Allo Inventory Reservation System

A Next.js application that solves the race condition problem in e-commerce checkout — reserving inventory temporarily while payment is processed.

## Live Demo


[https://allo-inventory-navy.vercel.app](https://allo-inventory-navy.vercel.app)

## How to Run Locally

### Prerequisites
- Node.js 18+
- A Supabase or Neon PostgreSQL database

### Setup

```bash
git clone https://github.com/sukanyasuresh2624/allo-inventory.git
cd allo-inventory
npm install
cp .env.example .env
# Fill in your DATABASE_URL and CRON_SECRET
```

### Database

```bash
npx prisma db push
npx prisma db seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How the Expiry Mechanism Works

Two-layer approach:

**Layer 1 — Lazy cleanup on read:**
Every `confirm` call checks `expiresAt < now()` inside the transaction. If expired, returns 410 and stock is released immediately.

**Layer 2 — Vercel Cron (every 5 minutes):**
`vercel.json` schedules `GET /api/cron/cleanup` every 5 minutes. It finds all `PENDING` reservations where `expiresAt < now()`, decrements `reservedStock`, and marks them `RELEASED`.

## How Concurrency is Handled

When two requests arrive simultaneously for the last unit:

1. Both enter `prisma.$transaction()`
2. Both run `SELECT ... FOR UPDATE` on the Inventory row
3. PostgreSQL row-level lock makes the second request **wait**
4. First commits → second re-reads → finds `availableStock = 0`
5. Second throws `INSUFFICIENT_STOCK` → returns **409**

No Redis needed for core logic. Pure PostgreSQL `FOR UPDATE`.

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products with available stock |
| GET | `/api/warehouses` | List warehouses |
| POST | `/api/reservations` | Reserve units (409 if no stock) |
| POST | `/api/reservations/:id/confirm` | Confirm reservation (410 if expired) |
| POST | `/api/reservations/:id/release` | Release reservation early |
| GET | `/api/cron/cleanup` | Release all expired reservations |

## Trade-offs & What I'd Do Differently

- **Connection pooling:** Using Supabase pooler URL in production to avoid hitting connection limits on the free tier.
- **Cron granularity:** 5-minute cleanup means stock could appear reserved up to 5 minutes after expiry. A dedicated worker (BullMQ) would give sub-minute cleanup.
- **Idempotency:** Implemented via `Idempotency-Key` header stored on the Reservation row with a unique constraint.
- **Frontend refresh:** UI updates in-place after confirm/cancel using React state — no page reload needed.

## Tech Stack

Next.js 16 · TypeScript · PostgreSQL (Supabase) · Prisma 6 · Zod · Tailwind CSS · shadcn/ui · Vercel
