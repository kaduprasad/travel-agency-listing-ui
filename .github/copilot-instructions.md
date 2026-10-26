# Copilot Instructions

## Project overview

**Skyline Travels** — a multi-tenant travel agency listing & booking UI built with Next.js 15 (App Router), Supabase (Postgres + RLS + Storage), Tailwind CSS, Radix UI, and Framer Motion. Deployed on Vercel.

The app serves a **single agency per deployment** identified by `NEXT_PUBLIC_DEFAULT_AGENCY_SLUG`. A super-admin can manage multiple agencies; each agency has its own admin users.

---

## App structure

```
src/
├── app/
│   ├── (auth)/               # Login page + server actions
│   │   ├── login/page.tsx
│   │   └── actions.ts        # signIn / signOut server actions
│   ├── (site)/               # Public-facing site (layout wraps header + footer)
│   │   ├── layout.tsx        # Loads agency, renders SiteHeader + SiteFooter
│   │   ├── page.tsx          # Home page: Hero + Services + Featured fleet + Why us
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── cars/
│   │       ├── page.tsx      # Full fleet listing
│   │       └── [id]/page.tsx # Car detail page with enquiry CTA
│   ├── admin/                # Protected admin panel (requires auth)
│   │   ├── layout.tsx        # Auth guard → redirects to /login if unauthenticated
│   │   ├── page.tsx          # Dashboard overview
│   │   ├── agency/           # Agency profile editor
│   │   ├── cars/             # Car CRUD (add, edit, toggle active, reorder)
│   │   ├── enquiries/        # Enquiries table + status updates
│   │   └── users/            # User management (super-admin only)
│   └── api/
│       ├── enquiries/route.ts    # POST — public enquiry submission
│       ├── push/subscribe/       # POST — save Web Push subscription
│       └── cron/ping/route.ts    # GET — daily cron to keep Supabase alive (Vercel cron)
│
├── components/
│   ├── site/
│   │   ├── hero.tsx              # Full-viewport hero with photo background + animations
│   │   ├── hero-3d.tsx           # Background image component (public/hero-bg.jpg)
│   │   ├── site-header.tsx       # Sticky nav with mobile menu
│   │   ├── site-footer.tsx
│   │   ├── car-card.tsx          # Car listing card with enquiry trigger
│   │   ├── car-detail-enquiry.tsx
│   │   └── enquiry-dialog.tsx    # Enquiry modal — CityField, DateField, Field helpers
│   ├── admin/
│   │   ├── admin-shell.tsx       # Sidebar + top bar layout
│   │   ├── agency-form.tsx
│   │   ├── car-form-dialog.tsx
│   │   ├── cars-manager.tsx
│   │   ├── enquiries-table.tsx
│   │   ├── enquiries-chart.tsx
│   │   ├── users-manager.tsx
│   │   └── enable-notifications-button.tsx  # Web Push opt-in
│   └── ui/                   # Shadcn/Radix primitives (Button, Input, Dialog, etc.)
│
├── lib/
│   ├── constants.ts          # TRAVEL_TYPES, ENQUIRY_STATUSES, DEFAULT_AGENCY_SLUG
│   ├── maharashtra-cities.ts # City list for autocomplete dropdowns
│   ├── database.types.ts     # Supabase generated types (Agency, Car, Enquiry, etc.)
│   ├── utils.ts              # cn() helper
│   ├── data/
│   │   ├── agency.ts         # getAgencyBySlug, getAgencyOrNotFound, getAgencyCars, getCarById
│   │   └── session.ts        # getSessionProfile — reads Supabase auth session + profile
│   ├── push/send.ts          # sendPushToAgency — Web Push to all agency admins
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client + service role client
│   │   └── middleware.ts     # Session refresh helper
│   └── validation/
│       └── enquiry.ts        # Zod schema for enquiry form (used client + server)
│
├── hooks/use-toast.ts
└── middleware.ts             # Supabase session refresh on every request

supabase/
├── schema.sql                # Full schema, RLS, storage, seed — paste into SQL Editor to bootstrap
└── promote-super-admin.sql   # One-time script to elevate a user to super_admin

public/
├── hero-bg.jpg               # Hero background photo (highway/travel scene, ~375KB)
├── manifest.webmanifest      # PWA manifest
├── sw.js                     # Service worker for Web Push
└── icons/icon.svg
```

---

## Key data flows

### Enquiry submission (public)
1. User fills `EnquiryDialog` → client Zod validation → `POST /api/enquiries`
2. Server validates with Zod, inserts row into `public.enquiries` via anon Supabase client (RLS allows public insert)
3. Service role client fires Web Push notification to all subscribed admins of the agency
4. Admin sees new enquiry in `/admin/enquiries`

### Auth flow
- Supabase Auth (email/password). `middleware.ts` refreshes session on every request.
- On sign-in a `profiles` row is auto-created (trigger in schema.sql) with `role = agency_admin`.
- Admin layout reads `getSessionProfile()` — redirects to `/login` if no session.
- Super-admin role: set via `supabase/promote-super-admin.sql`.

### Agency resolution
- Every server component calls `getAgencyOrNotFound()` which reads `NEXT_PUBLIC_DEFAULT_AGENCY_SLUG` → looks up `agencies.slug` in Supabase.
- If agency not found → 404. This means the DB must be bootstrapped before the app loads.

---

## Project goals (from setup conversations)

- Single-agency deployment for **Skyline Travels**, Pune, Maharashtra, India
- Cars offered: Maruti Suzuki Dzire (Sedan), Maruti Suzuki Ertiga (MUV), Chevrolet Enjoy (MUV), 17 Seater Bus (Mini Bus)
- Travel types: Local, Inter City, Pickup & Drop, Trip Package
- Hero background: `public/hero-bg.jpg` (highway/travel photo)
- Date format throughout the UI: **dd/mm/yyyy** (Indian standard)
- City dropdowns use Maharashtra cities from `@/lib/maharashtra-cities`
- Supabase free tier — daily cron job (`/api/cron/ping`) keeps project from pausing
- Notifications to admin: Web Push (already built) — future consideration: Resend email or Telegram bot
- Target deployment: Vercel (Hobby plan), repo at `kaduprasad/travel-agency-listing-ui`

---

## Conventions

### Form elements
- Use the HTML `required` attribute on `<Input>` / `<Textarea>` — never append `*` to label text.
- Optional fields get `(optional)` in the label.

```tsx
// ✅ Correct
<Field id="full_name" label="Full Name" required placeholder="Your name" />
<Field id="email" label="Email (optional)" type="email" />

// ❌ Wrong
<Field id="full_name" label="Full Name *" />
```

### Cities dropdown
- Import from `@/lib/maharashtra-cities` — never inline the array in a component.
- Use `<CityField>` (in `enquiry-dialog.tsx`) for Maharashtra city autocomplete.
- `CityField` is shown for travel types: intercity, airport, package. For `local` use plain `<Field>` with label "Pickup Address" / "Drop Address".

### Date inputs
- Use `<DateField>` (in `enquiry-dialog.tsx`) — displays `dd/mm/yyyy`, stores ISO `yyyy-mm-dd` via hidden input.
- Never use `<input type="date">` directly in user-facing forms.

### Supabase clients
- `createClient()` — anon/user-scoped, use in server components and API routes for user data.
- `createServiceRoleClient()` — bypasses RLS, use only in API routes for privileged operations (e.g. push notifications). Never expose to the browser.

### Environment variables
- `NEXT_PUBLIC_*` — safe for browser
- `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` — server only, never in `NEXT_PUBLIC_*`
