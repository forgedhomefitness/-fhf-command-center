# Forged Home Fitness — AI Business Command Center

A Next.js dashboard that pulls live data from Stripe, Acuity Scheduling, QuickBooks, and Instagram, then uses the Anthropic Claude API to generate AI-powered daily briefings and weekly performance analysis.

Built for a single user (Matt Doherty, Forged Home Fitness LLC). No auth required — bookmark the URL.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and add your API keys
cp .env.example .env.local
# Edit .env.local with your actual keys

# 3. Run locally
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project → select this repo
3. Add all environment variables from `.env.example` in the Vercel dashboard (Settings → Environment Variables)
4. Deploy — Vercel handles the rest

## Environment Variables

| Variable | Source | Notes |
|----------|--------|-------|
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Developers → API Keys | Starts with `sk_live_` |
| `ACUITY_USER_ID` | Acuity → Business Settings → Integrations → API | Numeric ID |
| `ACUITY_API_KEY` | Same location as User ID | Long string |
| `QB_ACCESS_TOKEN` | [developer.intuit.com](https://developer.intuit.com) | Expires every 60 days — refresh manually |
| `QB_REALM_ID` | QuickBooks company settings | Numeric company ID |
| `INSTAGRAM_ACCESS_TOKEN` | [developers.facebook.com](https://developers.facebook.com) | Long-lived token, expires 60 days |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Starts with `sk-ant-` |

## Refreshing Tokens

**QuickBooks:** Go to developer.intuit.com every ~55 days. Copy new access token. Update `QB_ACCESS_TOKEN` in Vercel env vars. Redeploy.

**Instagram:** Long-lived tokens last 60 days. Refresh via the Graph API token refresh endpoint or generate a new one at developers.facebook.com. Update `INSTAGRAM_ACCESS_TOKEN` in Vercel.

## Architecture

```
app/
  page.js              → Main dashboard (metrics, briefing, charts)
  checkin/page.js      → Weekly check-in form + AI analysis
  tasks/page.js        → Task manager with priorities (localStorage)
  settings/page.js     → Integration status + setup guides
  api/
    stripe/route.js    → Proxies Stripe API (revenue, customers)
    acuity/route.js    → Proxies Acuity API (sessions, bookings)
    quickbooks/route.js → Proxies QuickBooks P&L reports
    instagram/route.js → Proxies Instagram Graph API
    ai/route.js        → Proxies Anthropic Claude API

components/            → Reusable UI components
lib/
  constants.js         → Business context, pricing, phases, AI system prompt
  utils.js             → Date, currency, and progress utilities
```

## Adding Future Integrations

1. Create a new API route in `app/api/{service}/route.js`
2. Add the env var to `.env.example` and Vercel
3. Add a card to `app/settings/page.js`
4. Wire data into the dashboard or check-in page

## Tech Stack

- **Next.js 14** (App Router) + React 18
- **Tailwind CSS** for styling
- **Recharts** for charts (available, not yet wired)
- **Vercel** for deployment (free tier)
- **Anthropic Claude API** for AI layer
