# White-label a new River Tech app

Copyright (c) 2026 River Tech. All rights reserved.

River Kit is the product-agnostic shell. SmartRefill, Sales Portal, and future apps should start here — not by cloning refill inventory or rider dispatch.

## 1. Copy the kit

```bash
cp -R river-kit my-new-app
cd my-new-app
```

Keep `LICENSE`, `COPYRIGHT`, and `Copyright (c) 2026 River Tech` headers.

## 2. Change brand identity

Edit both files so legal copy and API `X-Product-Name` stay aligned:

- `frontend/src/config/brand.ts`
- `backend/functions/src/config/brand.ts`

Fields that must change per product:

| Field | Example |
| :--- | :--- |
| `productName` | `AquaDesk` |
| `productSlug` | `aquadesk` |
| `tagline` | One-line promise |
| `supportEmail` | Product support inbox |
| `colors.primary` | Hex brand color |
| `appUrl` | Production origin |

Replace assets in `frontend/public/brand/`:

- `logo.svg`
- `favicon.ico`
- `apple-touch-icon.png`

## 3. Point at a Firebase project

Copy env examples and fill real values:

- `frontend/.env.local` from `frontend/.env.example`
- `backend/functions/.env` from `backend/functions/.env.example`

Set `NEXT_PUBLIC_DEMO_MODE=false` when Auth + Firestore are live.

## 4. Add a domain (not a dump of SmartRefill)

Frontend:

```
frontend/src/features/{domain}/
  components/
  hooks/
  services/
  types/
  lib/{domain}-copy.ts
  index.ts
```

Backend:

```
backend/functions/src/
  routes/{domain}-routes.ts
  handlers/{domain}-handler.ts
  services/{domain}/{domain}-service.ts
  services/{domain}/{domain}-schema.ts
```

Register routes in `index-api.ts`. Pair every POST/PUT/DELETE with GET.

## 5. Landing page templates

Browse `/landing`. Fork one layout instead of inventing a new home page:

| Slug | Use |
| :--- | :--- |
| `/landing/product` | Default SaaS home |
| `/landing/waitlist` | Launch / email capture |
| `/landing/pricing` | Plans + FAQ |
| `/landing/story` | About / brand story |

Copy lives in `frontend/src/features/landing-templates/lib/*-copy.ts` and still reads `brand.ts`.

## 6. What not to copy from SmartRefill

Do not lift water-station domains into a new product: customers, riders, inventory gallons, portal QR, PayMongo refill plans, Community Messenger.

Reuse only platform patterns: auth middleware, `apiClient`, live-sync, audit log, modular folders, responsive shell.
