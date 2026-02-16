# Car Detailing Booking System

A full-stack booking platform for car detailing businesses built with `Next.js 14`, `Prisma`, `Stripe`, `TailwindCSS`, and WhatsApp Business API automations.

## Overview
- End‑to‑end customer booking flow with advance payment.
- Admin dashboard to manage bookings and track services.
- Automated WhatsApp messaging: confirmations, reminders, service updates, and payment receipts.
- Configurable business hours, slots, and payment percentage.

## Tech Stack
- Framework: `Next.js 14` (App Router)
- Database ORM: `Prisma`
- UI: `TailwindCSS`, `Radix UI`, custom components in `src/components/ui`
- Auth: `next-auth`
- Payments: `Stripe`
- Messaging: WhatsApp Business Cloud API
- Charts/Analytics: `recharts`

## Project Structure
- `src/app/page.tsx` — Public landing page with services and CTA.
- `src/app/booking/page.tsx` — Customer booking flow.
- `src/app/confirmation/page.tsx` — Post‑booking confirmation view.
- `src/app/admin/*` — Admin area: dashboard, bookings, payments, analytics, settings.
- `src/app/api/*` — API routes for bookings, payments, WhatsApp, admin features.
- `prisma/schema.prisma` — Database models.
- `scripts/*` — Setup and environment helpers.

## Design System
- UI primitives in `src/components/ui` (button, card, input, select, tabs, etc.).
- TailwindCSS utility classes with light effects, gradients, and glass card visuals.
- Icons via `lucide-react`.

Example usages:
- Landing page CTA buttons in `src/app/page.tsx:141`.
- Booking form visuals in `src/components/booking/BookingForm.tsx:203`.

## Booking Flow
Customer path is split into steps: select service → pick date/time → enter info → pay advance → confirmation.

- Step state machine in `src/app/booking/page.tsx:24`.
- Service selection: `ServiceSelector` renders available services.
- Availability: time slots via `src/app/api/bookings/available-slots/route.ts`.
- Submit info triggers payment‑first flow:
  - Create Stripe PaymentIntent with booking metadata in `src/app/api/payments/stripe/create-intent-prebooking/route.ts:60`.
  - Store `paymentIntentId` temporarily and proceed to `PaymentSection`.
- Payment success finalizes booking in either route:
  - Webhook path for automatic creation from metadata `src/app/api/payments/stripe/webhook/route.ts:57`.
  - Client success handler `src/app/api/payments/stripe/success/route.ts:98` (handles both booking‑first and payment‑first).

UI states and transitions are implemented in `src/app/booking/page.tsx:190` and `src/app/booking/page.tsx:355`.

## Payments
- Advance payment percentage configurable in `BusinessSettings.advancePaymentPercent` (`prisma/schema.prisma:202`).
- Payment intent creation and metadata packing in `src/app/api/payments/stripe/create-intent-prebooking/route.ts`.
- Webhook verifies signatures and creates bookings/payments in `src/app/api/payments/stripe/webhook/route.ts`.
- Success route records payments and sends confirmations in `src/app/api/payments/stripe/success/route.ts`.
- Admin can request final payments after service completion; revenue tallied in analytics `src/app/admin/analytics/page.tsx:79`.

## WhatsApp Automations
Event‑driven messages for key points:
- Booking confirmation on successful advance payment `src/app/api/payments/stripe/success/route.ts:98`.
- Reminder 24h before service via cron `src/app/api/cron/send-reminders/route.ts`.
- Service started notification `src/app/api/bookings/[id]/start-service/route.ts:59`.
- Service completion notification with payment link.
- Final payment confirmation and review link template `whatsapp-templates/final_payment_confirmation.json`.
- Webhook handling for inbound/outbound messages `src/app/api/whatsapp/webhook/route.ts:1`.

Templates can be generated with `npm run whatsapp:templates`.

## Admin Area
- Dashboard with today’s bookings and actions `src/app/admin/dashboard/page.tsx:44`.
- Start/Complete service triggers with toasts and server calls `src/app/admin/dashboard/page.tsx:131`.
- Full bookings management `src/app/admin/bookings/page.tsx` (status transitions validated server‑side `src/app/api/bookings/[id]/route.ts:1`).
- Payments overview `src/app/admin/payments/page.tsx`.
- Analytics with totals and automation stats `src/app/admin/analytics/page.tsx:79` + API `src/app/api/admin/analytics/route.ts`.
- Settings (business info, hours, slot duration, messaging toggles) `src/app/admin/settings/page.tsx` + API `src/app/api/admin/settings/route.ts:99`.
- WhatsApp chat interface `src/app/admin/chat/page.tsx` and `src/components/chat/ChatInterface.tsx`.

## Public Pages
- Landing page highlights services and credibility (`src/app/page.tsx`).
- Booking page path: `src/app/booking/page.tsx` and variant by business `src/app/booking/[businessId]/page.tsx:42`.
- Confirmation page summarizes booking details `src/app/confirmation/page.tsx:171`.
- Public share links under `src/app/public/*`.

## Data Models
Key Prisma models in `prisma/schema.prisma`:
- `Business`, `BusinessSettings` — company and configuration (`prisma/schema.prisma:189`).
- `Service` — packages with price/duration (`prisma/schema.prisma:47`).
- `Booking` — customer appointment, status, amounts (`prisma/schema.prisma:62`).
- `Payment` — transactions, method, status (`prisma/schema.prisma:108`).
- `Notification` — messages sent across channels (`prisma/schema.prisma:131`).
- `WhatsAppChat`/`WhatsAppMessage` — chat and messages (`prisma/schema.prisma:154`).

## Environment Setup
1) Copy env file on install or manually:
- `npm run setup` (creates `.env.local` from `.env.example` if missing) `scripts/post-install.js`.
- Verify required variables: `npm run check-env` `scripts/check-env.js`.

Required envs (`.env.example`):
- `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
- Stripe: `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- WhatsApp: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
- App: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BUSINESS_NAME`, `NEXT_PUBLIC_CURRENCY`, `ADVANCE_PAYMENT_PERCENTAGE`.

## Running Locally
- Install dependencies: `npm install`.
- Generate Prisma client: `npm run db:generate`.
- Push schema: `npm run db:push`.
- Seed data: `npm run db:seed`.
- Start dev server: `npm run dev` (http://localhost:3000).
- Listen to Stripe webhooks: `npm run stripe:listen`.

Admin login (seeded): `admin@cardetailing.com` / `admin123` `scripts/post-install.js:43`.

## Operational Flows
- Cron reminders: POST to `/api/cron/send-reminders` with `Authorization: Bearer ${CRON_SECRET}`.
- Status transitions enforced in `src/app/api/bookings/[id]/route.ts:1` with allowed paths from `CONFIRMED → IN_PROGRESS → COMPLETED`.
- Real‑time admin notifications via Server‑Sent Events `src/app/api/admin/notifications/stream/route.ts:34`.

## Security Notes
- Webhook signature validation in Stripe routes.
- WhatsApp webhook verification token `WHATSAPP_WEBHOOK_VERIFY_TOKEN` `src/app/api/whatsapp/webhook/route.ts`.
- No sensitive data logged; environment variables required for production.

## Design Context
- Responsive, friendly visuals with gradients and glass cards.
- Clear affordances for primary actions (CTA, progress steps, toasts).
- Admin flows use confirmations before mutating state, and server‑side validation of status transitions.
- Service cards, calendars, and time‑slot pickers present availability and pricing concisely.

## Testing Guide
Manual checklist is provided in `WORKFLOW_TEST_SUMMARY.md`:
- Create booking and complete advance payment.
- Verify WhatsApp confirmation if configured.
- Use admin dashboard to start/complete service.
- Confirm final payment flow and review prompts.

## Deployment
- Use managed Postgres (Supabase, Railway, Neon) for `DATABASE_URL`.
- Set Stripe and WhatsApp credentials in environment.
- Configure webhook endpoints and cron runner.
- Run `npm run build` and `npm start` in production.

