# Skyline Travels

A mobile-first car rental website for Skyline Travels. It runs on Next.js and deploys to Vercel without a database, API keys, or other environment variables.

## Included

- Public home, fleet, car detail, about, and contact pages
- Four sample vehicles with rates, seating, features, and photo galleries
- Responsive layout and animated landing page
- Enquiry form that opens WhatsApp with the trip details prefilled
- Database-backed admin and API code retained but disabled by default

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000.

## Edit agency and car details

Update [`src/lib/data/site-data.ts`](src/lib/data/site-data.ts). This file contains the contact details, WhatsApp number, address, vehicle descriptions, rates, and image URLs. Replace the sample agency phone/WhatsApp number and other sample details with Skyline Travels' confirmed details before publishing.

Vehicle photos are optimized WebP files in `public/cars`; original uploads are preserved in `assets/car-image-sources`. Sharp is installed for conversion. To regenerate the WebP files after updating the source images and mappings, run `npm run images:convert`.

Enquiries are handed off to WhatsApp and are not saved by the website. The customer must press Send in WhatsApp to deliver the message.

## Deploy to Vercel

Import this repository into Vercel and deploy with the detected Next.js settings. No environment variables are required. `NEXT_PUBLIC_ENABLE_DATABASE` defaults to `false`; it can also be set explicitly to `false` in Vercel.

Admin login, database enquiry storage, image uploads, and push notifications are not active in this standalone version. Re-enabling them later requires setting the flag to `true` and configuring the matching Supabase project and schema.
