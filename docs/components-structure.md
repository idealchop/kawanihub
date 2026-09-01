# Component structure

Copyright (c) 2026 River Tech. All rights reserved.

- `src/components/ui/` — primitives (button, input, textarea, select, checkbox, switch, dialog, dropdown, tabs, table, data-table, alert, avatar, skeleton, progress, empty-state). No API calls.
- `Table` — simple list (cards on mobile, table from `md` up).
- `DataTable` — search, filters, sort, rows-per-page, pagination; cards below `md`. Pass `layout="list"` for inbox-style rows at every breakpoint. Columns may be `hidden` so they still sort without showing.
- `/components` — public gallery of those primitives.
- `/landing` — landing page templates (product, waitlist, pricing, story).
- `src/components/` — brand mark, copyright line (shared chrome).
- `src/features/{domain}/components/` — screens and dialogs. Mutations go through `services/` → `apiClient`.

Keep files kebab-case. Split a component when it exceeds ~300 lines.
