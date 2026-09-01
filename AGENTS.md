# Kawanihub — agent guide

Copyright (c) 2026 River Tech. All rights reserved.

This repository is **Kawanihub**, a constituent-service app forked from River Kit. It follows the same frontend/backend contract as SmartRefill V3, without SmartRefill domain code.

## Paths

| Alias | Path |
| :--- | :--- |
| Frontend | `frontend/` |
| Backend | `backend/functions/` |
| Docs | `docs/` |
| Skills | `.agents/skills/` |
| Brand | `frontend/src/config/brand.ts`, `backend/functions/src/config/brand.ts` |

## Contract

1. Frontend = UI + GET/read + presentation.
2. Backend = mutations + heavy processing + Firestore writes + audit.
3. Every mutation domain has matching GET endpoints.
4. No business Firestore writes from the browser.
5. No `constants/` folders — co-locate copy in `lib/{concern}-copy.ts`.
6. Filenames are kebab-case.
7. New product branding is **only** `brand.ts` + `public/brand/` assets.

## Challenge ideas first

Do not implement a request as specified until you have challenged it.

1. Restate the job (who is the official, what work are they finishing).
2. Critique the idea: who it fails, what it overbuilds, what a desk already does.
3. Propose a sharper alternative.
4. Implement only after the user picks — or implement the alternative if they asked you to decide.

Prefer one strong workflow over five admin screens. Local demo auth is not a product. Charts of dummy data are not analytics.

## Skills to read first

- `.agents/skills/river-kit-orchestrator/SKILL.md`
- `.agents/skills/modular-architecture/SKILL.md`
- `.agents/skills/river-kit-api-gateway/SKILL.md`
- `docs/README.md`

If docs and code disagree, fix one of them in the same change.
