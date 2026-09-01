---
name: river-kit-responsive-ui
description: Responsive UI protocol for River Kit. Three-tier layout, dialogs, a11y, SEO.
---

# River Kit UI protocol

Copyright (c) 2026 River Tech. All rights reserved.

## Breakpoints

| Tier | Viewport |
| :--- | :--- |
| Mobile | < 768px |
| Tablet | 768–1023px |
| Desktop | ≥ 1024px |

## Rules

- No horizontal overflow on any tier.
- Dialogs: header + scroll body + footer. Body scrolls, chrome does not.
- Tables on desktop; cards on mobile.
- Loading, empty, and error states are required on list screens.
- Public routes have title + description metadata.
- App routes may be `noindex`.
