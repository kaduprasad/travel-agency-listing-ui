# Standalone setup

## Local development

```powershell
npm install
npm run dev
```

No `.env.local` file or external service is required. The app uses the bundled data in `src/lib/data/site-data.ts`.

## Set the agency details

Before publishing, edit `src/lib/data/site-data.ts` and confirm the agency phone number, WhatsApp number (international format, digits only), email, address, car rates, and images. The current values include sample contact details.

When a customer submits an enquiry, the site opens WhatsApp with their name, phone, trip, and selected vehicle prefilled. The customer must send the message from WhatsApp. The site does not store enquiries or notify an admin independently.

## Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, import the repository. Keep the framework as Next.js and deploy; no environment variables are needed.
3. For a custom domain, add it under the Vercel project’s **Settings → Domains** and follow Vercel’s DNS instructions.

## Database feature flag

`NEXT_PUBLIC_ENABLE_DATABASE` defaults to `false`. With it off, middleware skips Supabase session checks, `/admin` redirects to the public site, and database APIs return `503`. Keep it off for this deliverable.

Database-backed features are retained for later work. Re-enabling the flag alone is not enough: configure valid Supabase URL/keys and run the matching schema before setting `NEXT_PUBLIC_ENABLE_DATABASE=true` in the environment and redeploying.
