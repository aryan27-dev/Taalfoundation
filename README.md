# Taal Foundation — Kathak Dance Academy

Website and student/admin ERP portal for Taal Foundation dance academy.

## Features

- **Marketing site** — public homepage
- **Student portal** — fees (Razorpay), attendance, events, uniforms, schedule, announcements
- **Admin ERP** — students, batches, fees, attendance, events, uniforms, announcements, schedule
- **Payments** — Razorpay checkout + webhook + offline cash marking + PDF receipts
- **Excel** — bulk student import + export for students, fees, attendance
- **Reminders** — email + WhatsApp fee reminders (cron + manual)
- **Cron jobs** — monthly fee generation, weekly reminders, annual fee increment

## Tech Stack

- Next.js 15, React 19, TypeScript
- PostgreSQL (Supabase) + Prisma
- NextAuth.js, Razorpay, Nodemailer, Twilio (WhatsApp), ExcelJS

## Getting Started

> **Note:** Database credentials live in `.env.local`. Use `npm run db:push` / `npm run db:seed` / `npm run db:studio` — or `npx prisma db push` after adding `prisma.config.ts` (loads `.env.local` automatically).

1. Copy `.env.local.example` to `.env.local` and fill in your credentials
2. Install dependencies: `npm install`
3. Push database schema: `npm run db:push` (loads `.env.local` — do not use bare `npx prisma db push`)
4. Seed test accounts: `npm run db:seed`
5. Run dev server: `npm run dev`

### Test Logins (after seeding)

| Role    | Email                        | Password      |
|---------|------------------------------|---------------|
| Admin   | `admin@taalfoundation.com`   | `Admin@1234`  |
| Student | `student@taalfoundation.com` | `Student@1234`|

## Deploy to Vercel

1. Push this repo to GitHub and import in [Vercel](https://vercel.com)
2. Add **all** env vars from `.env.local.example` in the Vercel dashboard
3. Set `NEXTAUTH_URL` to your production URL (e.g. `https://taalfoundation.vercel.app`)
4. Set `ALLOWED_ORIGINS` to your production domain
5. Use Supabase **pooler** URL (port 6543) for `DATABASE_URL` in Vercel
6. After first deploy, run against production DB:
   ```bash
   DATABASE_URL="your-direct-url" npx prisma db push
   npm run db:seed
   ```
7. In Razorpay Dashboard → Webhooks → add `https://your-domain/api/fees/webhook`
8. Configure Twilio WhatsApp Business sender for production reminders

### Cron jobs (automatic via `vercel.json`)

| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| 1st of month 9:00 AM | `/api/cron/generate-fees` | Generate monthly fees |
| Mondays 9:00 AM | `/api/cron/fee-reminders` | Email + WhatsApp reminders |
| Jan 1 midnight | `/api/cron/annual-increment` | ₹100 annual fee increment |

Set `CRON_SECRET` in Vercel — cron routes require `Authorization: Bearer <CRON_SECRET>`.
