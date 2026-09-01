# Firestore schema

Copyright (c) 2026 River Tech. All rights reserved.

Read this before any mutation or new collection.

## Tenancy

| Collection | Path | Purpose |
| :--- | :--- | :--- |
| workspaces | `workspaces/{workspaceId}` | Tenant record, branding snapshot |
| members | `workspaces/{workspaceId}/members/{memberId}` | Role and app permissions |
| solicitations | `workspaces/{workspaceId}/solicitations/{solicitationId}` | Constituent solicitation queue |
| documents | `workspaces/{workspaceId}/documents/{documentId}` | Document tracking |
| events | `workspaces/{workspaceId}/events/{eventId}` | Calendar events |
| notifications | `workspaces/{workspaceId}/notifications/{notificationId}` | Desk alerts |
| media_content_types | `workspaces/{workspaceId}/media_content_types/{typeId}` | Media content types |
| media_pieces | `workspaces/{workspaceId}/media_pieces/{pieceId}` | Media production pieces |
| items | `workspaces/{workspaceId}/items/{itemId}` | Sample domain (kit leftover) |
| audit_logs | `workspaces/{workspaceId}/audit_logs/{logId}` | Mutation history / activity |

Analytics is computed on GET. It is not a collection.

## `workspaces/{workspaceId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| name | string | Display name |
| slug | string | URL-safe |
| ownerUid | string | Firebase Auth uid |
| themePrimary | string | Optional hex override |
| createdAt | timestamp | Server time |
| updatedAt | timestamp | Server time |

## `members/{memberId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| uid | string | Auth uid or generated invite id |
| email | string | Required |
| displayName | string | Required |
| role | `'owner' \| 'admin' \| 'staff' \| 'viewer'` | Owner cannot be deleted |
| permissions | string[] | App modules: `dashboard`, `solicitation`, `media`, `users`, `notifications`, `calendar`, `documents`, `activity` |
| status | `'active' \| 'invited' \| 'disabled'` | |
| createdBy | string | uid |
| createdAt | timestamp | |
| updatedAt | timestamp | |

Owner and admin always have every module. Staff/viewer use the stored `permissions` list.

## `solicitations/{solicitationId}`

One record per request. Status moves `under_review` → `pending_validation` → `eligible` → `ready_to_claim` → `claimed` (or `rejected`). Papers URL is the public receipt until a control number is issued on Eligible.

| Field | Type | Notes |
| :--- | :--- | :--- |
| requesterName | string | Required; composed from first + middle + last + suffix when identity is present |
| beneficiaryName | string | Who the help is for. Required on the public request |
| barangay | string | Optional; copied from identity.barangay |
| contact | string | Optional; mobile, used when emailing the claim code |
| idNumber | string | Optional; preferred person key for the 3-month rule |
| identity | object | Optional on seed. `{ firstName, middleName, lastName, suffix, noMiddleName, requesterIsBeneficiary, beneficiary: { firstName, middleName, lastName, suffix, noMiddleName }, beneficiaryRelation, beneficiaryRelationOther, mobile, telephone, email, building, street, subdivision, barangay, idType, idNumber, idPhotoName, idPhoto, idPhotoBackName, idPhotoBack }`. `beneficiaryRelation` is `spouse \| parent \| child \| sibling \| relative \| guardian \| other` when the requestor is not the beneficiary; `beneficiaryRelationOther` is required when relation is `other`. Public form requires a middle name unless `noMiddleName` is true. ID photos optional for now. |
| kind | `'burial' \| 'education' \| 'medical' \| 'events' \| 'financial' \| 'daily'` | Issues a requirement catalog |
| notes | string | Reason; required on the public request |
| status | `'under_review' \| 'pending_validation' \| 'rejected' \| 'eligible' \| 'ready_to_claim' \| 'claimed'` | Request starts at `under_review` (Pending for Review) with no control number. Reviewer sends to `pending_validation` (For Approval). Admin marks `eligible` or `rejected` (Not Eligible). Eligible issues the control number and stays Eligible. Accountant then marks `ready_to_claim` (Ready for Claim) when funds are ready. Public claim sets `claimed`. |
| controlNumber | string | Empty until admin marks eligible. Public track uses this from Eligible onward. Public claim still requires Ready for Claim. |
| assignedReviewerUid / Name | string | Admin assigns the reviewer |
| assignedAccountantUid / Name | string | Admin assigns the accountant |
| expedited / escalated | boolean | Reviewer speed-up or admin review |
| rejectReason / missingNote / reviewerFeedback | string | Shown to the requestor on track |
| findingNote | string | Desk-only reviewer finding. Admin can edit it after Not Eligible. The requestor sees it only when it is copied into `rejectReason` on Not Eligible. |
| findingByName / findingAt | string | Who last saved the reviewer finding, and when. |
| attentionMarks | `('special' \| 'odd' \| 'conflict' \| 'government_event')[]` | Desk remarks: special handling, odd case, desk related to the requestor, government event. Not policy flags. |
| adminFindingNote | string | Desk-only admin finding. Overall decision is the live status (`eligible` / `rejected`). Admin fills this after For Approval. Not shown on the public record unless copied into `rejectReason`. |
| adminFindingByName / adminFindingAt | string | Who last saved the admin finding, and when. |
| accountantNote | string | Desk-only accountant remarks for the funds. Editable after Eligible. |
| fundAmount | number | Amount to provide, in pesos. Required before Ready for Claim. Not shown on the public record. |
| accountantByName / accountantAt | string | Who last saved the accountant issue, and when. |
| claimPhoto / acknowledged | string / boolean | Required on claim |
| requirements | `{ id, label, submitted, validated, photo, photoName, note }[]` | Issued from the kind catalog. Desk Review uploads one photo per item and sets `submitted`. Desk writes `note` and sets `validated` (fulfilled). A photo does not mark the paper fulfilled. |
| relatives | `{ name, relation }[]` | First family: spouse, parent, child, sibling |
| flags | `{ type, message, relatedSolicitationId? }[]` | `cooldown`, `relative`, `suspicious_request`, `suspicious_requester`, `suspicious_beneficiary` |
| cooldownBlocked | boolean | Same person within 90 days |
| controlIssuedAt | string | ISO datetime when the control number was issued |
| claimedAt | string | ISO datetime |
| claimedByName | string | Must match requester name |
| createdBy | string | uid |
| createdAt | timestamp | |
| updatedAt | timestamp | |

## `documents/{documentId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| title | string | Required |
| referenceNo | string | Optional tracking number |
| requester | string | Required |
| barangay | string | Optional |
| kind | `'request' \| 'permit' \| 'certification' \| 'report' \| 'other'` | |
| status | `'received' \| 'in_review' \| 'released' \| 'returned'` | |
| dueAt | string | Optional ISO date |
| notes | string | Optional |
| createdBy | string | uid |
| createdAt | timestamp | |
| updatedAt | timestamp | |

## `events/{eventId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| title | string | Required |
| notes | string | Optional |
| startsAt | string | ISO datetime |
| endsAt | string | ISO datetime |
| location | string | Optional |
| kind | `'meeting' \| 'outreach' \| 'deadline' \| 'other'` | |
| createdBy | string | uid |
| createdAt | timestamp | |
| updatedAt | timestamp | |

## `media_content_types/{typeId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| slug | string | URL key; stable after create. Reserved: `types`, `new` |
| name | string | Required |
| hint | string | Short label under the name |
| icon | string | Lucide catalog key. Desk picker shows most-used first; search the rest. |
| status | `'active' \| 'inactive'` | Inactive types stay on old pieces |
| createdBy | string | uid |
| createdAt | timestamp | |
| updatedAt | timestamp | |

## `media_pieces/{pieceId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| title | string | Required; piece name |
| type | string | Content type slug |
| status | string | Pipeline: `not_started` → `editing` → `revision` → `caption` → `ready_for_review` → `under_review` → `ready_for_publish` → `scheduled_post` → `published` \| `not_published`. New pieces: no dates → `not_started`; past/today shoot → `editing`; past/today publish → `published`. Edit does not auto-overwrite, except `scheduled_post` becomes `published` when `publishDate` is today or earlier (on create, update, list, and get). |
| editorUids | string[] | Editors. Legacy `editorUid` / `personUid` read as a one-item list |
| reviewerUids | string[] | Reviewers. Legacy `reviewerUid` reads as a one-item list |
| deployedUids | string[] | Deployers on the shoot |
| caption | string | Post copy |
| subs | string | Optional subtitles |
| episode | string | Optional episode number or code |
| shootDate | string | Optional `YYYY-MM-DD` |
| publishDate | string | Optional `YYYY-MM-DD` |
| driveUrl | string | Optional Drive URL |
| fbUrl | string | Optional Facebook URL |
| link | string | Legacy; Drive or FB URL on read |
| createdBy | string | uid |
| createdAt | timestamp | |
| updatedAt | timestamp | |

## `media_pieces/{pieceId}/comments/{commentId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| workspaceId | string | |
| pieceId | string | |
| body | string | Required, 1–800 chars |
| authorUid | string | uid |
| authorName | string | Display name at write |
| reactions | map | Emoji → uid list. Allowlist 👍 ❤️ 😂 👀 |
| createdAt | timestamp | Newest first on read |
| updatedAt | timestamp | |

## `media_pieces/{pieceId}/events/{eventId}`

Piece timeline, not calendar events. Types: `created`, `updated`, `status`, `assigned`, `comment`, `reaction`, `deleted`. Delete keeps the timeline so Recent activity can still show the removal.

| Field | Type | Notes |
| :--- | :--- | :--- |
| workspaceId | string | |
| pieceId | string | |
| type | string | As above |
| actorUid | string | uid |
| actorName | string | Display name at write |
| payload | map | Status from/to, role + added/removed uids, comment preview, emoji, optional `title` (create/delete) |
| createdAt | timestamp | Newest first on read |

## `notifications/{notificationId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| title | string | Required |
| body | string | Optional |
| kind | `'solicitation' \| 'document' \| 'event' \| 'system' \| 'user'` | |
| read | boolean | Default `false` |
| createdBy | string | uid |
| createdAt | timestamp | |

## `items/{itemId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| title | string | Required, 1–120 chars |
| notes | string | Optional |
| status | `'open' \| 'done'` | Default `open` |
| createdBy | string | uid |
| createdAt | timestamp | Server time |
| updatedAt | timestamp | Server time |

## `audit_logs/{logId}`

| Field | Type | Notes |
| :--- | :--- | :--- |
| action | string | e.g. `documents.create` |
| actorUid | string | |
| resource | string | Collection path |
| resourceId | string | |
| createdAt | timestamp | |

Frontend must not write these collections. Backend services only.
