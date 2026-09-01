# Backend documentation

Copyright (c) 2026 River Tech. All rights reserved.

Path: `backend/functions/`

## Layers

| Layer | Path |
| :--- | :--- |
| Routes | `src/routes/{domain}-routes.ts` |
| Handlers | `src/handlers/{domain}-handler.ts` |
| Services | `src/services/{domain}/` |
| Middleware | `src/middleware/` |
| Config | `src/config/` |

## Endpoints

| Method | Path |
| :--- | :--- |
| GET | `/health` |
| GET | `/workspaces` |
| POST | `/workspaces` |
| GET | `/workspaces/:workspaceId/analytics` |
| GET | `/workspaces/:workspaceId/members` |
| GET | `/workspaces/:workspaceId/members/me` |
| GET | `/workspaces/:workspaceId/members/:memberId` |
| POST | `/workspaces/:workspaceId/members` |
| PUT | `/workspaces/:workspaceId/members/:memberId` |
| DELETE | `/workspaces/:workspaceId/members/:memberId` |
| GET | `/workspaces/:workspaceId/media-types` |
| GET | `/workspaces/:workspaceId/media-types/:typeId` |
| POST | `/workspaces/:workspaceId/media-types` |
| PUT | `/workspaces/:workspaceId/media-types/:typeId` |
| DELETE | `/workspaces/:workspaceId/media-types/:typeId` |
| GET | `/workspaces/:workspaceId/media` | List. Pipeline order; Published and Not published last. Due `scheduled_post` rows are written as `published`. Local demo pads to 200 pieces. |
| GET | `/workspaces/:workspaceId/media/:pieceId` |
| POST | `/workspaces/:workspaceId/media` |
| PUT | `/workspaces/:workspaceId/media/:pieceId` |
| DELETE | `/workspaces/:workspaceId/media/:pieceId` | Writes a `deleted` history event and removes comments; the timeline stays for Recent activity. |
| GET | `/workspaces/:workspaceId/media/events` | Workspace media activity, newest first. Query `page`, `pageSize` (default 20). |
| GET | `/workspaces/:workspaceId/media/:pieceId/comments` | Newest first. Query `page`, `pageSize` (default 5). |
| GET | `/workspaces/:workspaceId/media/:pieceId/comments/:commentId` |
| POST | `/workspaces/:workspaceId/media/:pieceId/comments` | `{ body }`. Editor, reviewer, deployer, or anyone with media access. Writes a history event. |
| POST | `/workspaces/:workspaceId/media/:pieceId/comments/:commentId/reactions` | `{ emoji }` toggle. Allowlist 👍 ❤️ 😂 👀. Adding writes a history event. |
| GET | `/workspaces/:workspaceId/media/:pieceId/events` | Piece history, newest first. Query `page`, `pageSize` (default 10). |
| GET | `/workspaces/:workspaceId/media/:pieceId/events/:eventId` |
| GET | `/workspaces/:workspaceId/notifications` |
| GET | `/workspaces/:workspaceId/notifications/:notificationId` |
| POST | `/workspaces/:workspaceId/notifications` |
| PUT | `/workspaces/:workspaceId/notifications/:notificationId` |
| DELETE | `/workspaces/:workspaceId/notifications/:notificationId` |
| GET | `/workspaces/:workspaceId/events` |
| GET | `/workspaces/:workspaceId/events/:eventId` |
| POST | `/workspaces/:workspaceId/events` |
| PUT | `/workspaces/:workspaceId/events/:eventId` |
| DELETE | `/workspaces/:workspaceId/events/:eventId` |
| GET | `/workspaces/:workspaceId/documents` |
| GET | `/workspaces/:workspaceId/documents/:documentId` |
| POST | `/workspaces/:workspaceId/documents` |
| PUT | `/workspaces/:workspaceId/documents/:documentId` |
| DELETE | `/workspaces/:workspaceId/documents/:documentId` |
| GET | `/workspaces/:workspaceId/activity` |
| GET | `/workspaces/:workspaceId/activity/:logId` |
| GET | `/workspaces/:workspaceId/solicitations` |
| GET | `/workspaces/:workspaceId/solicitations/report` | Desk report. Query `format=csv\|xlsx\|pdf` (default `csv`). Admin only. Returns `{ filename, mime, body }` where `body` is base64. CSV also includes `csv`. PDF is a solicitation statement (letterhead, fund, status counts, case table). Excel has a Statement sheet and a Cases sheet. |
| GET | `/workspaces/:workspaceId/solicitations/:solicitationId` |
| GET | `/workspaces/:workspaceId/solicitations/:solicitationId/due-diligence` |
| POST | `/workspaces/:workspaceId/solicitations` |
| PUT | `/workspaces/:workspaceId/solicitations/:solicitationId` | Desk update. Requirement patches may include `photo` / `photoName` (walk-in papers), `note`, and `validated`. A photo sets `submitted`; it does not set `validated`. Optional `findingNote`, `attentionMarks`, `adminFindingNote`, `accountantNote`, and `fundAmount` are desk-only. Only admin may write `adminFindingNote`. Accountant (or admin covering) may write `accountantNote` / `fundAmount` after Eligible. Each section stamps who saved it and when. |
| POST | `/workspaces/:workspaceId/solicitations/:solicitationId/review` |
| POST | `/workspaces/:workspaceId/solicitations/:solicitationId/approve` | Admin marks eligible after validate. Issues the control number. Status stays `eligible`. |
| POST | `/workspaces/:workspaceId/solicitations/:solicitationId/ready-to-claim` | Accountant (or admin covering) marks funds ready; status becomes `ready_to_claim`. Requires Eligible, a control number, and `fundAmount` greater than 0. |
| POST | `/workspaces/:workspaceId/solicitations/:solicitationId/reject` |
| POST | `/workspaces/:workspaceId/solicitations/claim` |
| GET | `/public/workspaces/:workspaceId/solicitations/catalog` |
| GET | `/public/workspaces/:workspaceId/solicitations/:solicitationId` | Public receipt. |
| POST | `/public/workspaces/:workspaceId/solicitations` | Public request. Status is Pending for Review (`under_review`). ID photos optional. Desk photographs papers later. |
| POST | `/public/workspaces/:workspaceId/solicitations/:solicitationId/requirements` | Unused by the public UI. Desk uploads papers on Review. |
| POST | `/public/workspaces/:workspaceId/solicitations/track` | Look up a request by control number. |
| POST | `/public/workspaces/:workspaceId/solicitations/claim` |

## Commands

```bash
npm install
npm run serve:local   # Express on :8080
npm run lint
npm test
npm run build
```

Deploy with Firebase Functions after `firebase use` points at the product project. Function export name: `kawanihubApi`.
