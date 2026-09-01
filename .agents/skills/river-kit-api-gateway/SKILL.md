---
name: river-kit-api-gateway
description: Cloud Functions API gateway protocol for River Kit. Lean routing, auth, mutations, GET pairing.
---

# River Kit API gateway

Copyright (c) 2026 River Tech. All rights reserved.

Backend is exclusively responsible for mutations, heavy jobs, Firestore writes, auth verification, and audit logs.

## Dual endpoints

```
GET    /workspaces/:workspaceId/items
GET    /workspaces/:workspaceId/items/:itemId
POST   /workspaces/:workspaceId/items
PUT    /workspaces/:workspaceId/items/:itemId
DELETE /workspaces/:workspaceId/items/:itemId
```

Never add a mutation without the matching GET.

## Security

- Verify Firebase ID token (or `DEMO_TOKEN` on local/demo only)
- Scope all queries by `workspaceId`
- Zod at the handler boundary
