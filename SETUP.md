# Setup guide

This is a one-time, ~20-minute setup. Everything below is free.

## 1. Create a Supabase project

1. Sign up at https://supabase.com (free) and create a **new project**. Save the database password somewhere safe — you won’t need it for the app, but it can’t be recovered.
2. After the project is provisioned, go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never put in client code)

## 2. Run the schema

1. In Supabase, open **SQL Editor → New query**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) from this repo, paste the entire file, and click **Run**.
3. The script creates all tables, RLS policies, triggers, the `car-images` storage bucket, and seeds the **Skyline Travels** agency with 4 sample cars. It’s safe to re-run.

## 3. Create your super-admin account

1. In Supabase, go to **Authentication → Users → Add user** (top right). Choose **Create new user**.
2. Enter your email and a strong password. Tick **Auto-confirm user**.
3. Open `supabase/promote-super-admin.sql`, change `CHANGE_ME@example.com` to the email you just used, and run it in the SQL editor.

You’re now the super-admin and can sign in at `/login`.

## 4. Generate VAPID keys for Web Push

In your terminal, run:
```powershell
npx --yes web-push generate-vapid-keys
```
Copy the two keys it prints into `.env.local`:
- `Public Key` → `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `Private Key` → `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` is any `mailto:` you control.

If you skip this step, the site still works — push notifications will simply be disabled.

## 5. Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000 for the public site, or http://localhost:3000/login for the admin console.

## 6. Deploy to Vercel

1. Push this repo to GitHub.
2. Go to https://vercel.com → **Add New → Project**, import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. **Environment Variables**: add every key from `.env.local` (Supabase URL, anon key, service-role key, VAPID public/private/subject, default agency slug, site URL — set `NEXT_PUBLIC_SITE_URL` to your final domain).
5. Click **Deploy**. First build takes a couple of minutes.

That’s it — you’re live on `<project>.vercel.app` for free.

## 7. Custom domain for Skyline Travels

1. In Vercel, open the project → **Settings → Domains → Add**.
2. Type the domain (e.g. `skylinetravels.in`). Vercel shows the DNS records you need to add at your registrar (`A` record `76.76.21.21`, or a `CNAME` for `www`).
3. Once DNS propagates (usually a few minutes), Vercel auto-issues an SSL certificate.
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel project env to the new domain and redeploy.

## 8. Enable push notifications on the admin’s phone

1. Open the deployed site on Android Chrome, sign in at `/login`.
2. The admin shell shows an **Enable notifications** button — tap it and accept the system prompt.
3. From the Chrome menu, **Install app** to add a home-screen icon (PWA).
4. New enquiries now buzz the phone even when the tab is closed.

## 9. Future: WhatsApp notifications

When you’re ready, two options:
- **Twilio WhatsApp API** (paid per message, generous free trial)
- **Meta WhatsApp Cloud API** (free up to 1,000 conversations/month — needs Meta Business verification)

Both fit into the same place — add the call inside `src/app/api/enquiries/route.ts` next to `sendPushToAgency`. The enquiry record already carries everything needed (`full_name`, `phone`, `travel_type`, `car_model_snapshot`, …).

## 10. Where to look if something breaks

| Symptom | Where to check |
|---|---|
| `Agency not found` on home page | `agencies.slug` in Supabase matches `NEXT_PUBLIC_DEFAULT_AGENCY_SLUG` (default: `skyline-travels`) |
| Login redirects back to `/login` | Profile row exists in `public.profiles` with a non-null `agency_id` |
| Image upload fails | The `car-images` bucket exists and is **Public** (schema sets this) |
| Push doesn’t fire | VAPID keys set in Vercel env + `/sw.js` is served (open it in browser to check) |
| Enquiry insert fails | RLS policy `enquiries_public_insert` exists and is enabled |

## 11. Useful URLs

- Public site: `/`, `/cars`, `/cars/<id>`, `/about`, `/contact`
- Admin: `/login`, `/admin`, `/admin/enquiries`, `/admin/cars`, `/admin/agency`, `/admin/users` (super-admin only)
- API: `POST /api/enquiries`, `POST/DELETE /api/push/subscribe`
