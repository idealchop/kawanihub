# Frontend documentation

Copyright (c) 2026 River Tech. All rights reserved.

Path: `frontend/`

## Layout

| Path | Role |
| :--- | :--- |
| `src/app/` | Thin routes |
| `src/features/{domain}/` | Vertical slices |
| `src/components/` | Reusable UI only |
| `src/config/brand.ts` | White-label identity |
| `src/lib/` | apiClient, Firebase, live-sync, memory-store, locale |
| `src/features/locale/` | Language switcher (desk English default, `/solicit` Filipino default) |

## Routes

| Route | Group | Purpose |
| :--- | :--- | :--- |
| `/` | public | Redirects to `/solicit` |
| `/landing` | marketing | Landing page template index |
| `/landing/[slug]` | marketing | Product, waitlist, pricing, story templates |
| `/components` | marketing | UI primitive gallery |
| `/login` | auth | Sign in / sign up |
| `/solicit` | public | Public entrance — two picture doors (Request, Claim) plus an interactive 3-step picture path (request, desk papers, claim) |
| `/solicit/request` | public | Request form — name (with suffix), beneficiary checkbox, address, contact, type, reason. Submit puts the case in Pending for Review. The desk photographs papers. |
| `/solicit/papers/[id]` | public | Old papers URL. Shows the submitted receipt only; requestors no longer upload. |
| `/solicit/claim` | public | Claim form — control number, name, receive photo, acknowledgement. Status must be `ready_to_claim`. |
| `/dashboard` | desk | Dashboard with Solicitation (default) and Media tabs. Solicitation tab: four stage KPI cards, solicitation fund card, and barangay load map. Media tab: still-open queue, recent activity, who is holding work, and productivity section. `/overview` redirects here. |
| `/overview` | desk | Redirects to `/dashboard`. |
| `/queue` | desk | Staff solicitation page (nav label Solicitation). Details show the date requested and how long the case has been open (min / hr / days). The live Queue table excludes claimed cases; those sit in the Archived table on the same page and stay labeled Claimed. Admin can generate a queue report (Excel, CSV, or PDF statement) of the cases they can see. Reviewer and admin can attach paper photos from the case Review cards, then mark Fulfilled. Reviewer finding, accountant issue (remarks + amount, after Eligible), and admin finding sit in that order under Person check. Each card shows who saved it and when. Eligible issues the control number and stays Eligible. Accountant (or admin covering) marks Ready for Claim when funds are ready and an amount is set. Reviewer sees admin finding read-only. Overall decision is available after For Approval. Admin can open Review to edit findings on Not Eligible, Eligible, and Ready for Claim; reviewer can edit the reviewer finding only while Pending for Review. Not Eligible asks for a confirm first: after save, that decision cannot be overridden. |
| `/documents` | desk | Redirects to `/dashboard` |
| `/calendar` | desk | Redirects to `/dashboard` |
| `/media` | desk | Media production board. KPIs count In edit, In review, Ready to post, and Due today; click one to filter list, board, and calendar. Search, Status, Type of content, When, and Who sit above the List / Board / Calendar tabs and apply to all three views. Type remains a filter (and `/media/types` catalog). The Board tab is four columns named like the KPIs: In edit, In review, Ready to post, and Closed. Status color dots on the header show which statuses sit in that column; each card still has its actual status pill. Drag onto a column to move into that group (defaulting to editing, ready for review, ready for publish, or published); drag onto a card to take that card’s status. Cards also show title, type, shoot/publish dates, editor, open age, Needs attention, and link hosts. There is no per-column create field; Add project content stays in the header. Calendar chips use the piece status color and mark each day as Shoot or Publish (a piece can appear on both dates). The calendar defaults to month and can switch to week or day; pieces have dates only, so those views are the same chips at a tighter range, not an hourly grid. Search and filters still apply; When with a date range keeps only that kind of day. Chips also show type, how long it has been open, and Needs attention when it is late. The list has Details, Editor, Reviewer, Deployer, Status, and Actions. Details show Needs attention when a publish date has arrived (or a shoot date passed while still not started) and how long the piece has been open. Default order follows the production pipeline; Published and Not published sit last. Scheduled posts whose publish date has arrived become Published. People and status save on the list. When is shoot, publish, or both, with today / this week / custom range. Who is editor, reviewer, deployer, or anyone, multi-select. A Showing bar lists active filters; Clear all removes them. Click a piece to view a card: colored status, how long it has been open, Needs attention when it is late, shoot-to-publish dates, who has it, caption, Drive/Facebook actions, and comments. Empty optional fields stay hidden. The kebab has View, Edit, History, and Delete. History is the piece timeline: added, edited, status, assigned, comment preview, and who reacted. Add project content is a dialog. |
| `/media/types` | desk | Content type catalog — add, edit, delete unused types, activate or deactivate. All media is an outline button next to Add type and returns to `/media`. Icon picker shows most-used first; search reveals the rest. |
| `/media/{slug}` | desk | Same board scoped to that content type slug. |
| `/media/new` | desk | Redirects to `/media` |
| `/users` | desk | Roles and app permissions |
| `/notifications` | desk | Desk alerts |
| `/activity` | desk | Audit / activity logs |
| `/items` | desk | Sample CRUD domain |

Old `/dashboard` and `/dashboard/*` URLs redirect to desk routes. `/` and `/solicitation` redirect to `/solicit`. `/request` and `/claim` redirect to the matching form. `/solicit/track` redirects to `/solicit`. Request and claim do not require sign-in. Staff sign in only to work `/queue`. The public portal defaults to Filipino when the session has no stored language; the desk stays English-default. The language switcher still works on both.

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

The desk UI defaults to English. `/solicit` defaults to Filipino until the visitor picks a language. The choice is stored in memory for the session only.

## Tests

Unit tests live in `src/__tests__/unit/`. Add a test when you add a service or brand helper.
