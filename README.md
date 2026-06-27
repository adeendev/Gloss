<p align="center">
  <br/>
  <img src="https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&style=for-the-badge" alt="Next.js 14"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&style=for-the-badge" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&style=for-the-badge" alt="Prisma"/>
  <img src="https://img.shields.io/badge/Stripe-635BFF?logo=stripe&style=for-the-badge" alt="Stripe"/>
  <img src="https://img.shields.io/badge/WhatsApp-25D366?logo=whatsapp&style=for-the-badge" alt="WhatsApp API"/>
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&style=for-the-badge" alt="Tailwind CSS"/>
  <br/>
  <img src="https://img.shields.io/badge/license-MIT-emerald?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/status-production--ready-brightgreen?style=for-the-badge"/>
</p>

<br/>

<h1 align="center">
  ✨ GLOSS
</h1>

<h3 align="center">
  The premium booking & operations platform for car detailing businesses.
</h3>

<p align="center">
  <b>Booking flow</b> · <b>WhatsApp automation</b> · <b>Stripe payments</b> · <b>Multi-tenant admin</b>
</p>

<br/>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-workflow">Workflow</a> •
  <a href="#-admin-panel">Admin</a> •
  <a href="#-stack">Stack</a> •
  <a href="#-api">API</a> •
  <a href="#-deploy">Deploy</a>
</p>

<br/>

---

## 🌟 Why Gloss?

> Most booking systems are generic. **Gloss** is built *for* detailers, *by* people who understand the craft.

Gloss handles the entire customer journey—from the moment they pick a service to the moment they leave a Google review—while you focus on the work.

| Without Gloss | With Gloss |
|---|---|
| Phone-tag bookings scattered across text messages | Self-serve 24/7 booking with instant confirmation |
| Manual payment chasing | Stripe-powered advance + final payments, automated |
| Forgetting to remind customers | WhatsApp reminders, service updates, invoices — all fired automatically |
| Juggling spreadsheets & disjointed tools | One dashboard: bookings, chat, analytics, payments |

<br/>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>📅 Smart Booking Engine</h3>
      <ul>
        <li>Real-time calendar with service-based availability</li>
        <li>Time-slot picker (auto-configurable intervals)</li>
        <li>Conflict detection & resolution</li>
        <li>Live availability streaming</li>
      </ul>
    </td>
    <td width="50%">
      <h3>💳 Stripe Payment Suite</h3>
      <ul>
        <li>Advance deposit (configurable %) + final balance</li>
        <li>Payment intents with booking metadata</li>
        <li>Signed webhooks for bulletproof processing</li>
        <li>Full refund support</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📱 WhatsApp Automation</h3>
      <ul>
        <li>Booking confirmation on payment</li>
        <li>24h appointment reminder (cron)</li>
        <li>"Service started" live notification</li>
        <li>Invoice with payment link on completion</li>
        <li>Final receipt + Google review prompt</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🏢 Multi-Tenant Admin</h3>
      <ul>
        <li>Per-business booking URLs <code>/booking/:id</code></li>
        <li>Isolated data and branding</li>
        <li>Role-based access (Admin / Staff)</li>
        <li>Custom working hours, slots, payment %</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📊 Analytics Dashboard</h3>
      <ul>
        <li>Revenue charts + automation stats</li>
        <li>Service breakdown & customer metrics</li>
        <li>Real-time SSE notifications</li>
        <li>Powered by Recharts</li>
      </ul>
    </td>
    <td width="50%">
      <h3>💬 WhatsApp Chat Inbox</h3>
      <ul>
        <li>Full 2-way messaging from admin</li>
        <li>Conversation history with status</li>
        <li>Unread count tracking</li>
        <li>Message read receipts</li>
      </ul>
    </td>
  </tr>
</table>

---

<a name="quick-start"></a>
## 🚀 Quick Start — 60 seconds

```bash
# 1. Clone
git clone https://github.com/adeendev/Gloss.git
cd Gloss

# 2. Install
npm install

# 3. Set up environment
cp .env.example .env.local
# → edit .env.local with your Stripe / WhatsApp keys

# 4. Initialize DB (SQLite — zero config)
npm run db:generate
npm run db:push
npm run db:seed

# 5. Start
npm run dev
```

→ **Open [http://localhost:3000](http://localhost:3000)** 🎉

> **Default admin login:** `admin@cardetailing.com` / `admin123`

---

## 🔐 Environment

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | `file:./dev.db` (SQLite) or PostgreSQL URL |
| `NEXTAUTH_SECRET` | ✅ | Random 32+ char string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` (dev) |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | ⚠️ payments | Stripe publishable key |
| `STRIPE_SECRET_KEY` | ⚠️ payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ payments | Stripe webhook signing secret |
| `WHATSAPP_PHONE_NUMBER_ID` | ⚠️ WhatsApp | Meta WhatsApp phone ID |
| `WHATSAPP_ACCESS_TOKEN` | ⚠️ WhatsApp | WhatsApp API token |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | ⚠️ WhatsApp | Your custom verify token |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app URL |
| `NEXT_PUBLIC_BUSINESS_NAME` | ✅ | Your business name |
| `NEXT_PUBLIC_CURRENCY` | ✅ | e.g. `USD`, `GBP`, `EUR` |
| `ADVANCE_PAYMENT_PERCENTAGE` | ✅ | e.g. `20` (default) |

> Run `npm run check-env` to validate your config.

<details>
<summary><b>📌 Where to get API keys</b></summary>
<br/>

| Service | How |
|---|---|
| **Stripe** | [Dashboard → API Keys](https://dashboard.stripe.com/apikeys) |
| **Stripe Webhook** | [Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) — add `POST /api/payments/stripe/webhook` |
| **WhatsApp** | [Meta Developers](https://developers.facebook.com/) → Create App → WhatsApp → API Setup |

</details>

---

<a name="workflow"></a>
## 🔄 Complete Workflow

```
           🧑 CUSTOMER                          👤 ADMIN
               │                                    │
               │  Selects service & time             │
               │  Fills details                      │
               │  Pays advance (20%) ─── Stripe ──>  │
               │                                    │
               ▼                                    │
     ┌─────────────────┐                            │
     │  ✅ Booking      │                            │
     │    CONFIRMED     │                            │
     │  📱 WhatsApp     │                            │
     │    confirmation  │                            │
     └─────────────────┘                            │
               │                                    │
     (24h later)                                    │
     ┌─────────────────┐                            │
     │  📱 WhatsApp     │                            │
     │    reminder      │                            │
     └─────────────────┘                            │
               │                                    │
               │                          ┌─────────▼─────────┐
               │                          │  Clicks            │
               │                          │  ▶ START SERVICE   │
               │                          └─────────┬─────────┘
               │                                    │
     ┌─────────────────┐                            │
     │  📱 "We're       │                            │
     │    working on    │◀───────────────────────────┘
     │    your car!"    │    Status → IN_PROGRESS
     └─────────────────┘                            │
               │                          ┌─────────▼─────────┐
               │                          │  Clicks            │
               │                          │  ✅ COMPLETE       │
               │                          └─────────┬─────────┘
               │                                    │
     ┌─────────────────┐                            │
     │  📱 Invoice +    │                            │
     │    payment link  │◀───────────────────────────┘
     │    Status DONE   │
     └─────────────────┘
               │
               │  Pays remaining balance ─── Stripe ──>
               │
               ▼
     ┌─────────────────┐
     │  📱 Receipt +    │
     │    Google Review │
     │    link          │
     │  ✅ Fully paid   │
     └─────────────────┘
```

---

<a name="admin-panel"></a>
## 🏢 Admin Panel

| Page | Path | What it does |
|---|---|---|
| **Login** | `/admin/login` | Secure JWT-based auth |
| **Dashboard** | `/admin/dashboard` | Today's bookings, start/complete actions |
| **Bookings** | `/admin/bookings` | Full CRUD + status transitions |
| **Payments** | `/admin/payments` | All transactions at a glance |
| **Analytics** | `/admin/analytics` | Revenue, service breakdown, automation stats |
| **Settings** | `/admin/settings` | Business hours, slot length, messaging toggles |
| **Chat** | `/admin/chat` | WhatsApp 2-way inbox |

---

<a name="stack"></a>
## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.x |
| **Database** | Prisma ORM + SQLite / PostgreSQL |
| **UI** | Tailwind CSS + Radix UI + Lucide icons |
| **Auth** | NextAuth.js 4 (JWT, credentials) |
| **Payments** | Stripe (Payment Intents + Webhooks) |
| **Messaging** | WhatsApp Business Cloud API |
| **Charts** | Recharts |
| **Validation** | Zod |
| **Notifications** | Sonner + SweetAlert2 |

---

<a name="api"></a>
## 🔌 API Reference

### Bookings

```
GET    /api/services?businessId=xxx       → List services
GET    /api/bookings/available-slots      → Available time slots
POST   /api/bookings                      → Create booking
GET    /api/bookings/:id                  → Booking detail
PATCH  /api/bookings/:id                  → Update status
POST   /api/bookings/:id/start-service    → Start (admin)
POST   /api/bookings/:id/complete-service → Complete (admin)
```

### Payments

```
POST   /api/payments/stripe/create-intent            → Payment intent
POST   /api/payments/stripe/create-intent-prebooking → Pre-booking intent
POST   /api/payments/stripe/webhook                  → Stripe events
GET    /api/payments/stripe/success                  → Post-payment handler
```

### WhatsApp

```
POST   /api/whatsapp/send                     → Send message
POST   /api/whatsapp/webhook                  → Inbound webhook
GET    /api/whatsapp/messages?chatId=xxx      → Chat history
POST   /api/whatsapp/chats/:chatId/read       → Mark read
```

### Admin & Cron

```
GET    /api/admin/analytics                → Stats & revenue
GET    /api/admin/settings                 → Get settings
PATCH  /api/admin/settings                 → Update settings
GET    /api/admin/payments                 → All payments
GET    /api/admin/notifications/stream     → SSE real-time
POST   /api/cron/send-reminders            → 24h reminder job
```

---

## 📁 Structure

```
gloss/
├── prisma/
│   ├── schema.prisma        # 9 data models
│   └── seed.ts              # Demo data seeder
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing
│   │   ├── booking/          # Customer flow
│   │   ├── confirmation/     # Post-booking
│   │   ├── admin/            # 7 admin pages
│   │   ├── public/           # Shareable links
│   │   └── api/              # 20+ route handlers
│   ├── components/
│   │   ├── ui/               # 14 primitives (Radix)
│   │   ├── booking/          # Booking widgets
│   │   ├── admin/            # Dashboard widgets
│   │   └── chat/             # WhatsApp chat UI
│   ├── lib/
│   │   ├── prisma.ts         # DB singleton
│   │   ├── stripe.ts         # Stripe helpers
│   │   ├── whatsapp.ts       # WhatsApp client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── utils.ts          # Formatting, slots
│   │   └── validators.ts     # Zod schemas
│   └── middleware.ts         # Route guard
├── scripts/                  # Setup tools
├── whatsapp-templates/       # 6 message templates
├── .env.example
└── start.sh                  # Auto-setup (bash + bat)
```

---

## 🗄 Data Models

```
Business ─── Service (price, duration)
    │
    ├── Booking (PENDING → CONFIRMED → IN_PROGRESS → COMPLETED → CANCELLED)
    │     ├── Payment (advance / final)
    │     └── Notification (dedup logs)
    │
    ├── User (admin / staff)
    ├── BusinessSettings (hours, config, toggles)
    └── WhatsAppChat
          └── WhatsAppMessage (2-way)
```

---

## 📱 WhatsApp Templates

| Template | Trigger |
|---|---|
| `booking_confirmation` | Advance payment success |
| `booking_reminder` | 24h before appointment |
| `service_started` | Admin starts service |
| `completion_invoice` | Service completed |
| `final_payment_confirmation` | Balance paid |

```bash
npm run whatsapp:templates   # generate template JSON files
```

> Templates must be submitted & approved via [Meta Business Manager](https://business.facebook.com/wa/manage/message-templates/) (24–48h).

---

<a name="deploy"></a>
## 🚀 Production Deployment

```bash
npx vercel --prod
```

### Checklist

- [ ] Swap SQLite → PostgreSQL (update `DATABASE_URL`)
- [ ] Set all env vars in Vercel dashboard
- [ ] Configure Stripe webhook → `yourdomain.com/api/payments/stripe/webhook`
- [ ] Configure WhatsApp webhook → `yourdomain.com/api/whatsapp/webhook`
- [ ] Submit WhatsApp templates for Meta approval
- [ ] Change default admin password
- [ ] Set up cron job for reminders (`POST /api/cron/send-reminders`)

---

## 🧪 Test Mode

```bash
# Stripe test card
Card:  4242 4242 4242 4242
Exp:   any future date
CVC:   any 3 digits
```

---

## 📄 License

**MIT** — Free for personal and commercial use.

---

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/built%20for-detailers-6b21a8?style=for-the-badge"/>
  <br/><br/>
  <b>Gloss</b> — made with precision, like a showroom finish.
</p>

<br/>
