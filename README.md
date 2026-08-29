# NIVORA

**Create. Personnalize. Impress.**

NIVORA is a SaaS platform where a customer picks a creative service (wedding
digital invitation, wedding video invitation, CV, business card, logo, brand
identity), fills a guided form, previews the result live, pays, and receives
a finished digital product they can share or download.

This repo is the **implementation** of the brief in `docs-api-spec.md`,
`docs-seed-data.md`, `apps/api/prisma/schema.prisma`, `.env.example` and
`design/Invitation-Islem-Akram.html` (the high-fidelity reference for the
public `/invite/:slug` page).

## Status

This is a **scaffold**: monorepo layout, tooling, database schema, module
boundaries and a stub for every route in the API spec, plus a stub for every
page/layout in the product spec. Feature logic still needs to be built out
module by module — see `docs-api-spec.md` for the exact endpoint contracts
and `README-product.md` for screen-by-screen specs.

## Stack

- **apps/api** — NestJS 10, TypeScript, Prisma 5 (PostgreSQL), Zod DTOs, BullMQ/Redis for jobs
- **apps/web** — React 18, TypeScript, Vite, react-i18next, react-router
- **packages/shared** — Zod schemas + types shared by api and web
- **packages/config** — shared eslint / tsconfig / prettier

## Getting started

```bash
pnpm install
cp .env.example .env      # fill in secrets; mock providers work out of the box
docker compose up -d      # postgres + redis + minio
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- API: http://localhost:3000/api/v1
- Web: http://localhost:5173

## Repo map

```
apps/
  api/          NestJS backend — one folder per domain module (see ARCHITECTURE)
  web/          React frontend — pages, layouts, components, i18n
packages/
  shared/       zod schemas + TS types shared by api and web
  config/       eslint, tsconfig, prettier bases
design/
  Invitation-Islem-Akram.html   hifi reference for /invite/:slug — recreate pixel-faithfully
  assets/                        flap-left.jpg, flap-right.jpg, seal.png, floral.jpg
docker-compose.yml               postgres + redis + minio (local dev)
docs-api-spec.md                 full REST surface
docs-seed-data.md                services, plans, prices, templates, music, coupons
```

## Design language

Two visual registers, deliberately separate:

**A. Platform UI (Classical design system)** — ground `#f3f2f2`, text `#201f1d`,
accent `#b68235` (gold), Cormorant Garamond headings over Lora body, colour as
stroke not fill, radius 4px, tabular figures, Lucide icons at 1.5 stroke.

**B. Wedding invitation content (ivory register)** — used only inside
invitation templates and `/invite/:slug`: ivory `#F7F2EA`, ground `#EFE8DC`,
card `#FBF7F0`, champagne `#C9B392`, dusty rose `#B9868A`, burgundy `#8A1C30`,
ink `#4A4038`. See `design/Invitation-Islem-Akram.html` for the exact
implementation.

## Security & conventions

See `docs-api-spec.md` and the doc-comments in `apps/api/src/common/` —
argon2id hashing, httpOnly rotated refresh cookies, ownership guards that
404 (not 403), signed uploads with magic-byte sniffing, integer minor-unit
money, provider abstractions with honest mock implementations (never a fake
success), idempotent generation jobs.
