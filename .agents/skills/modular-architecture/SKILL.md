---
name: modular-architecture
description: Modular structure for River Kit frontend and API. Feature modules, gateway layering, no constants/ folders.
---

# Modular architecture (River Kit)

Copyright (c) 2026 River Tech. All rights reserved.

## Frontend (`frontend/src`)

- `app/` — thin routes
- `features/{domain}/` — components, hooks, services, types, lib, `index.ts`
- `components/` — primitives only
- `lib/` — apiClient, Firebase, live-sync, memory-store
- `config/brand.ts` — white-label identity

Do not create `constants/` folders. Put copy in `lib/{screen}-copy.ts`.

No `localStorage` / `sessionStorage` for app state. Use `memory-store` or React state.

## Backend (`backend/functions/src`)

- `routes/` — HTTP + middleware
- `handlers/` — parse, call service, map errors
- `services/{domain}/` — logic + Firestore
- Co-located `*-schema.ts` (Zod)

## Checklist

- [ ] Correct layer
- [ ] No new `constants/`
- [ ] No business writes in frontend
- [ ] Dual GET + mutation
- [ ] Kebab-case files
