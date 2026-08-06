# Nexora RealtyOS Frontend

React and Vite frontend for Nexora RealtyOS. It covers the complete agency workflow: authentication, listings, CRM, transactions, rentals, team operations, reporting, marketing, billing, and public/customer experiences.

## Local development

1. Copy `.env.example` to `.env`.
2. Start the Django API on `http://localhost:8000`.
3. Install dependencies and start Vite:

   ```bash
   npm install
   npm run dev
   ```

The default API base URL is `http://localhost:8000/api`. Set `VITE_PAYMENT_URL` only after a hosted payment page is available. `VITE_NGROK_SKIP_WARNING` should normally remain `false`.

## Validation

```bash
npm test
npm run lint
npm run build
```

## Implemented navigation

- Dashboard
- Leads and interactions
- Unified Meta conversation inbox with lead conversion
- Properties and publishing
- Property media ordering, primary-image selection, and metadata
- Agent management for owners/admins
- Agent self-service public profiles
- Site visits
- Deal pipeline and analytics
- Social media connections and posts
- Agency branding and subscription settings
- Public agency, agent, property, inquiry, and site-visit pages
- Contacts, owners, dedicated deals and offers, documents, and leases
- Tasks, notifications, appointments, public availability, and team access
- Smart matching, property comparison, configurable fields/pipelines, and audit logs
- Stripe subscription checkout and billing management
- Customer portal, saved listings/search alerts, map search, and SEO share URLs
- Super-admin platform and agency controls

Public storefront URLs use `/agency/:slug`, with canonical listing pages at `/agency/:slug/listings/:shareSlug`, a customer portal at `/agency/:slug/portal`, and map search at `/agency/:slug/map`.

## Production notes

- Set `VITE_API_BASE_URL` to the public API origin ending in `/api`.
- Configure SPA history fallback so browser refreshes resolve to `index.html`.
- Serve the generated `dist/` directory through a CDN or static host.
- Configure `VITE_PAYMENT_URL` and `VITE_SUPPORT_EMAIL` for agency activation.
