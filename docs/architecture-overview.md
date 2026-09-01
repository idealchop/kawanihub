# Architecture overview

Copyright (c) 2026 River Tech. All rights reserved.

Kawanihub uses the same **lean API gateway** as River Kit / SmartRefill V3.

## Repository mapping

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| Frontend | `frontend/` | UI, GET/display, client state |
| Backend | `backend/functions/` | Mutations, heavy work, security, paired GETs |

## Responsibility split

**Frontend**

- Render pages and feature modules
- Call backend HTTP endpoints
- Firebase Auth client (sign-in / sign-out only)
- Never write business documents to Firestore

**Backend**

- All inserts, updates, deletes
- Zod validation, auth, workspace scope
- Audit log on every mutation
- GET for every mutation domain

## Dual endpoint rule

Example sample domain (`items`):

- `GET /workspaces/:workspaceId/items`
- `GET /workspaces/:workspaceId/items/:itemId`
- `POST /workspaces/:workspaceId/items`
- `PUT /workspaces/:workspaceId/items/:itemId`
- `DELETE /workspaces/:workspaceId/items/:itemId`

## Stack

**Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS 4, Radix Slot, Vitest.

**Backend:** Cloud Functions v2, Node 22, Express, Firebase Admin, Zod, Vitest.

## Data flow

```
User action
  → feature component
  → services/*-api.ts (apiClient)
  → Express route → handler → service
  → Firestore (or in-memory demo store)
  → audit_logs
  → JSON
  → liveSync refresh on the client
```

## Multitenancy

Every business record is scoped by `workspaceId`. Desk collections live at:

`workspaces/{workspaceId}/{members|solicitations|media_content_types|media_pieces|documents|events|notifications|audit_logs}/{id}` — media pieces also have `comments` and `events` subcollections (piece history, not calendar events).
