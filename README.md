# Kawanihub

**Sentro ng serbisyo para sa taumbayan.**

Personalized constituent app for a government official — built from [River Kit](https://github.com/idealchop/river-kit) by River Tech.

Copyright (c) 2026 River Tech. All rights reserved.

## Bakit Kawanihub?

*Kawani* = civil servant. *Hub* = sentro. The name is Tagalog-English for a **civil servant’s service center** — an official’s own desk to serve their people.

| Salita | Kahulugan |
| :--- | :--- |
| Kawani | Public servant / government employee |
| Hub | Sentro ng serbisyo |
| Solicitation | Constituent assistance request with requirements, a 3-month rule, and a control number |
| Tugon | Official response |

## What you get

| Layer | Path | Role |
| :--- | :--- | :--- |
| Frontend | `frontend/` | Next.js — landing, dashboard, desk modules |
| Backend | `backend/functions/` | Cloud Functions — mutations + GET |
| Brand | `frontend/src/config/brand.ts` | Kawanihub identity |

## Quick start

```bash
npm install
npm run dev:local
```

App: [http://localhost:3000](http://localhost:3000)  
API: [http://localhost:8080/health](http://localhost:8080/health)

Local mode is on (no Firebase). Sign in with **admin** / **password**, then open **Dashboard**. Dummy desk data is generated automatically.

## Copyright

```
Copyright (c) 2026 River Tech. All rights reserved.
```
