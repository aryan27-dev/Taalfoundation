# Taal Foundation — Kathak Dance Academy

Website and student/admin portal for Taal Foundation dance academy.

## Features

- **Marketing site** — public homepage
- **Student portal** — fees, attendance, events, uniforms, schedule, announcements
- **Admin dashboard** — manage students, fees, attendance, events, and more
- **Payments** — Razorpay integration with PDF receipts
- **Reminders** — email + WhatsApp fee reminders

## Tech Stack

- Next.js 15, React 19, TypeScript
- PostgreSQL (Supabase) + Prisma
- NextAuth.js, Razorpay, Nodemailer, Twilio (WhatsApp)

## Getting Started

1. Copy `.env.local.example` to `.env.local` and fill in your credentials
2. Install dependencies: `npm install`
3. Push database schema: `npm run db:push`
4. Seed test accounts: `npm run db:seed`
5. Run dev server: `npm run dev`

### Test Logins (after seeding)

| Role    | Email                        | Password      |
|---------|------------------------------|---------------|
| Admin   | `admin@taalfoundation.com`   | `Admin@1234`  |
| Student | `student@taalfoundation.com` | `Student@1234`|

## Deploy

Deploy to [Vercel](https://vercel.com). Add all env vars from `.env.local.example` in the Vercel dashboard.
