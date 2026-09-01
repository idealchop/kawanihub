---
name: river-kit-orchestrator
description: Master orchestrator for River Kit (River Tech white-label template). Enforces frontend/backend split and specialized agent boundaries.
---

# River Kit orchestrator

Copyright (c) 2026 River Tech. All rights reserved.

## Repository mapping

| Alias | Path |
| :--- | :--- |
| Frontend | `frontend/` |
| Backend | `backend/functions/` |

## Contract

**Frontend** — queries, UI, presentation, HTTP to the gateway. No business Firestore writes.

**Backend** — mutations, heavy processing, Admin SDK, audit logs, paired GET endpoints.

## Dual endpoint rule

Every domain that mutates must expose GET list + GET by id.

## Challenge first

Before scaffolding: restate the official’s job, critique the request, and propose a sharper alternative. Do not clone five admin modules because the user listed them.

## Handoff

1. Challenge the idea, then plan the feature (acceptance + layers).
2. Audit FE/BE split.
3. Scaffold `features/{domain}` and `routes → handlers → services`.
4. Validate schema against `docs/firestore_schema.md`.
5. Add Vitest coverage.

## Global rules

1. Branding changes go in `brand.ts` only.
2. Kebab-case filenames.
3. No `constants/` folders.
4. Keep River Tech copyright headers.
5. Do not copy SmartRefill domain modules into this kit.
