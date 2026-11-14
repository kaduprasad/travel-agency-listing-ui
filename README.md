# Skyline Travels

A mobile-first car rental website for Skyline Travels. It runs on Next.js and deploys to Vercel without a database, API keys, or other environment variables.

## Included

- Public home, fleet, car detail, about, and contact pages
- Cars and AC/non-AC buses with rates where available and photo galleries
- Responsive layout and animated landing page
- Enquiry form that opens WhatsApp with the trip details prefilled
- Database-backed admin and API code retained but disabled by default

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000.

## Edit agency, vehicle details, and rates

Update [`src/lib/data/site-data.ts`](src/lib/data/site-data.ts) for contact details, vehicle descriptions, and image URLs. Replace the sample agency phone/WhatsApp number and other sample details with Skyline Travels' confirmed details before publishing.

All public vehicle rates are configured in [`src/lib/data/vehicle-rates.ts`](src/lib/data/vehicle-rates.ts), keyed by vehicle ID. `localPerKm` and `outstationPerKm` are prices in rupees per kilometre; `package` specifies the distance and total price. Optional `airportFlat`, `driverPerDay`, and `minKmPerDay` fields can also be added. Omit a field to hide it, or leave a vehicle's rates empty to show "Contact us for a quote". Redeploy after editing.

Vehicle photos are stored in `public/cars`. Add bus photos there when available, then set the bus `images` and `primary_image` paths in `site-data.ts`.

Enquiries are handed off to WhatsApp and are not saved by the website. The customer must press Send in WhatsApp to deliver the message.

## Deploy to Vercel

Import this repository into Vercel and deploy with the detected Next.js settings. No environment variables are required. `NEXT_PUBLIC_ENABLE_DATABASE` defaults to `false`; it can also be set explicitly to `false` in Vercel.

Admin login, database enquiry storage, image uploads, and push notifications are not active in this standalone version. Re-enabling them later requires setting the flag to `true` and configuring the matching Supabase project and schema.
