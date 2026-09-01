# Auth flow

Copyright (c) 2026 River Tech. All rights reserved.

## Modes

| Mode | When | Behavior |
| :--- | :--- | :--- |
| Local demo (current) | Forced on in `app-config.ts` and `firebase-admin.ts` | No Firebase. Username `admin`, password `password`. Dummy desk data is seeded in memory. |
| Firebase | Turn `demoMode` back to the env flags | Email/password via Firebase Auth client |

## Local demo

1. Login form accepts only `admin` / `password`.
2. Session lives in memory (`memory-store`).
3. Requests send `Authorization: Bearer DEMO_TOKEN`.
4. Local API accepts `DEMO_TOKEN` and uid `demo-owner`.
5. First workspace access seeds members, solicitations, documents, events, and notifications.

Do not ship this local login to production.

`/solicit` is the public entrance (Request and Claim). Forms live on `/solicit/request` and `/solicit/claim`. They call `/public/workspaces/.../solicitations` with no auth token. After a request is submitted it is Pending for Review; the desk photographs papers in Review. `/solicit/papers/[id]` is a receipt only. Staff sign-in is only for the desk (`/dashboard`, `/queue`, …). Eligible issues a control number. Claim uses that code on Ready for Claim.

## Email / password (Firebase)

Used only after local mode is turned off:

1. User submits `login-form`.
2. Frontend calls Firebase Auth.
3. `apiClient` attaches `Authorization: Bearer <idToken>`.
4. Backend `validateFirebaseIdToken` verifies the token.
