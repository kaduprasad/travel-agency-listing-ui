# Skyline Travels

A modern, mobile-first travel agency website with built-in admin dashboard, real-time enquiry notifications, image uploads, and free deployment on Vercel.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui primitives · Framer Motion · Three.js (react-three-fiber) · Supabase (Postgres + Auth + Storage + Realtime) · Recharts · Web Push.

Everything used is free and open-source. Production cost on the free tiers is ₹0 — you only pay for the domain (and optionally WhatsApp API in the future).

## Features

### Public site
- Animated hero with subtle 3D scene (disabled on mobile / reduced-motion)
- Featured fleet with photos, pricing and per-km breakdown
- Per-car detail page with image gallery
- Mobile-first responsive layout, installable as a PWA
- Single-form enquiry dialog with travel-type switcher (Local · Intercity · Airport · Package)

### Admin (`/admin`)
- Email/password sign-in (Supabase Auth) — no public signup
- Dashboard with month-wise enquiry chart (last 12 months), counts, deltas, recent enquiries
- Enquiries table: filters by status/type, free-text search, one-click status update, realtime refresh, tap-to-call phone numbers
- Fleet manager: full CRUD with multi-image upload to Supabase Storage, set primary image, publish/hide
- Agency settings: brand, contact, address
- **Super-admin** only: create/delete admin users and assign them to an agency

### Notifications
- Web Push (works on Chrome desktop & Android) — admin clicks "Enable notifications" once and gets a push for every new enquiry, even with the tab closed
- The same enquiry is also broadcast via Supabase Realtime, so any open admin tab refreshes instantly
- WhatsApp notifications are a future enhancement; nothing in the data model needs to change to add them

### Roles
| Role | What they can do |
|---|---|
| **Public visitor** | Browse cars, submit enquiries (no login) |
| **agency_admin** | Manage their agency's cars, enquiries and profile |
| **super_admin (you)** | All of the above, for any agency, plus create new agencies/admins |

## Quick start

1. Copy env file and fill in Supabase keys:
   ```powershell
   Copy-Item .env.example .env.local
   ```
2. Install deps & run dev server:
   ```powershell
   npm install
   npm run dev
   ```

See [SETUP.md](SETUP.md) for the full step-by-step guide (Supabase project, schema, super-admin bootstrap, VAPID keys, Vercel deploy, custom domain).
