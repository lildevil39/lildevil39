# Handoff: NIVORA — digital creative studio platform

**NIVORA — Create. Personalize. Impress.**

## Overview

NIVORA is a SaaS platform where a customer picks a creative service (wedding digital invitation, wedding video invitation, CV, business card, logo, brand identity), fills a guided form, previews the result live, pays, and receives a finished digital product they can share or download.

This bundle is the **implementation brief**: architecture, database schema, API surface, provider abstractions, and one working design reference. It is written so Claude Code can build the real full-stack application in `lildevil39/lildevil39` (currently empty) without further context.

Read the files in this order:

1. `README.md` (this file) — product, flows, design language, screen specs
2. `ARCHITECTURE.md` — folder structure, provider abstractions, jobs, security
3. `prisma/schema.prisma` — the database
4. `api-spec.md` — every endpoint, DTO shape, guard
5. `.env.example` — configuration surface
6. `seed-data.md` — services, plans, prices, templates, music
7. `design/` — the HTML design reference for the public invitation

## About the design files

The files in `design/` are **design references created in HTML** — a prototype showing intended look and behaviour, not production code to copy. The task is to **recreate them in the target codebase** (React + TypeScript + Vite) using its own components and patterns. Everything else in this bundle is a written specification, not code to paste (except `prisma/schema.prisma` and `.env.example`, which are meant to be used as-is).

## Fidelity

- `design/Invitation-Islem-Akram.html` — **high fidelity**. Final colours, typography, motion and interaction for the public `/invite/:slug` page. Recreate pixel-faithfully.
- Every other screen in this document — **specification only** (layout, components, copy, tokens described in words). Build them with the Classical design system tokens listed below; no pixel mock exists yet. Ask the design owner for mocks if a screen needs to match exactly.

## Product scope

### Services (modular — new ones must be addable via DB rows + one form schema)

| Key | Name (FR) | Starter | Premium |
| --- | --- | --- | --- |
| `wedding-invitation` | Invitation de mariage digitale | 79 TND | 149 TND |
| `wedding-video` | Invitation vidéo de mariage | 129 TND | 249 TND |
| `cv` | CV / Resume | 39 TND | 69 TND |
| `business-card` | Carte de visite digitale | 29 TND | 49 TND |
| `logo` | Logo | 99 TND | 199 TND |
| `brand-identity` | Identité de marque | 299 TND | 599 TND |

Prices live in the `service_plans` table, never in code. Two currencies: **TND** (primary) and **EUR**. Admin edits prices without a deploy.

### Interface languages

**Français** (default) and **English**. i18n from day one (`react-i18next`, namespaced JSON). The *content* of a wedding invitation additionally supports **Arabic with full RTL** — that is guest-facing content, independent of the interface locale: `wedding_invitations.locale` drives `dir="rtl"` on the public page.

### Customer journey

```
Landing → Register/Login → Choose service → Multi-step form → Template → Live preview
→ Save project → Order summary → Payment → Generation job → Project ready → Share / Download
```

## User flows

### 1. Guest → customer
Landing CTA "Créer mon projet" → if unauthenticated, `/register?next=/create`. Register issues an email-verification token; unverified users can browse the dashboard and build drafts but **cannot pay**. After login → `/dashboard`.

### 2. Create project
`/create` shows the six service cards. Selecting one creates a `projects` row with `status=DRAFT` immediately (so autosave has a target) and routes to `/create/{serviceKey}?projectId=…`.

### 3. Multi-step form (wedding invitation, 7 steps)
Each step PATCHes the project; the form never loses data on refresh. Steps: Couple → Détails → Texte → Musique → Photos → Template → Aperçu.

### 4. Order and payment
"Enregistrer et commander" creates an `orders` row (`PENDING_PAYMENT`) with a price snapshot from `service_plans`. Payment goes through the provider's hosted checkout; the webhook — not the browser redirect — flips the order to `PAID`. On success → `/dashboard/orders/{id}`.

### 5. Delivery
Paid order enqueues a `generation_jobs` row. For a wedding invitation, generation is synchronous rendering (slug + published record). For video / logo / brand identity, the job stays `QUEUED` until an AI provider is configured — the UI shows honest status, never a fake result.

## Screens

Every screen below is desktop + tablet + mobile. Breakpoints: `sm 640 / md 768 / lg 1024 / xl 1280`. Mobile is the priority for `/invite/:slug`.

### Landing `/`
- **Hero** — full-viewport, near-white ground, headline in Cormorant Garamond ~72px/1.02 flush-left over a justified Lora sub-paragraph (max 56ch); two buttons side by side: "Créer mon projet" (accent outline) and "Découvrir nos services" (ghost). Right column: a matted `.plate` image (invitation photograph) with a slow 8s scale 1→1.04 drift.
- **Services** — 3×2 grid of bordered cards (`.card`, 1px `--color-border`, radius 4px, no fill). Each: kicker (service number, tabular figures), title, one-line FR description, price "à partir de 79 TND", Lucide icon at 20px stroke 1.5. Hover: border → `--color-accent`, translateY(-2px), 200ms ease-out.
- **How it works** — 4 numbered steps on a single hairline rule: Choisissez / Personnalisez / Prévisualisez / Recevez.
- **Portfolio** — masonry of `.plate` images, filter chips per service.
- **Pricing** — two columns per service (Starter / Premium) with a feature checklist; currency toggle TND ⇄ EUR.
- **Testimonials** — quoted paragraphs in Lora italic, attribution in small caps letterspaced .3em.
- **FAQ** — native `<details>` accordions with hairline dividers.
- **Contact + Footer** — form (nom, email, service, message) and a 4-column footer.

### Auth `/login /register /forgot-password /reset-password/:token /verify-email/:token`
Centred 420px card on the near-white ground, brand wordmark above. Fields use `.field` + `.input`. Inline validation on blur; server errors above the submit button in `--color-accent-700`. Password rules: min 10 chars, shown as a live checklist.

### Customer dashboard `/dashboard`
- Sidebar 260px (collapses to a bottom tab bar under 768px): Dashboard, Mes projets, Créer un projet, Commandes, Paiements, Fichiers, Profil, Paramètres, Déconnexion.
- Header: "Bon retour, {firstName}" + notification bell with unread dot.
- Stat row: 3 bordered cards — Projets actifs, Terminés, Paiement en attente — number set 48px tabular figures, label small caps.
- Recent orders table (`.table`), status as `.tag`.
- For each published wedding invitation, an RSVP summary strip: Confirmés / Déclinés / En attente.

### Create `/create` and `/create/:serviceKey`
Service picker = same cards as the landing grid. The workflow screen is a two-column layout: left = the step form (max 640px), right = a sticky live preview (phone frame 392×844 for invitation/business card, A4 sheet for CV, 16:9 board for logo/brand). Under 1024px the preview collapses into a "Aperçu" button opening a full-screen sheet. Step rail across the top: numbered, completed steps get an accent underline.

### Public invitation `/invite/:slug`
Recreate `design/Invitation-Islem-Akram.html` faithfully. Order: sealed envelope → tap wax seal (flaps open, music starts on that gesture — never autoplay) → names → date → message → photo → countdown → programme → lieu + Maps → galerie → RSVP → vœux. No login. Server-rendered meta tags for WhatsApp link previews (og:title, og:image, og:description).

### Admin `/admin/*`
Same shell, different sidebar: Dashboard, Utilisateurs, Projets, Commandes, Paiements, Invitations, Vidéos, CVs, Logos, Identités, Templates, Musique, Fichiers, Coupons, Paramètres. Stats: total users, revenue (TND + EUR), orders, pending, completed. Admin can change order status, upload templates and music, edit prices and coupons, and open any project read-only. Every admin action writes an audit row.

## Design language

Two visual registers, deliberately separate:

**A. Platform UI (Classical design system, attached to this project)**
- Ground `#f3f2f2`, text `#201f1d`, single accent `#b68235` (gold).
- Cormorant Garamond headings over Lora body. Bold avoided; semibold caps the headings, display sizes set in the normal cut.
- Colour applied as **stroke, not fill** — outlined buttons, bordered cards, hairline dividers. No solid accent blocks, no heavy shadows.
- Radius 4px, spacing scale at 1.15× density, elevation `--shadow-sm/md/lg` only.
- Tabular figures for all numerals (prices, stats, times).
- Lucide icons, 1.5 stroke.
- Focus: `outline: 2px solid var(--color-accent); outline-offset: 2px`.

**B. Wedding invitation content (ivory register)** — used only inside invitation templates and `/invite/:slug`:
- Ivory `#F7F2EA`, ground `#EFE8DC`, card `#FBF7F0`, champagne `#C9B392`, soft beige `#A08E72`, dusty rose `#B9868A`, deep burgundy `#8A1C30`, ink `#4A4038`, muted `#8C7C64`.
- Cormorant Garamond throughout, 300–400 weights, italic for secondary lines, .4em letterspaced uppercase 10–11px for kickers.
- Paper grain (fractal-noise SVG at 42% opacity, multiply), floating petals, drifting floral ground at 14% opacity, wax seal, satin ribbon.
- Motion: reveals 1.1s `cubic-bezier(.2,.8,.2,1)`; envelope flaps 2.4s `cubic-bezier(.22,.9,.16,1)` rotateY ±104°; seal press 170ms → lift 1.6s; parallax factor 0.22 on the cover, 0.06 on the background.

## Design tokens (invitation register)

| Token | Value |
| --- | --- |
| ivory / paper | `#F7F2EA` |
| ground | `#EFE8DC` |
| card | `#FBF7F0` |
| champagne | `#C9B392` |
| beige | `#A08E72` |
| dusty rose | `#B9868A` |
| burgundy | `#8A1C30` |
| burgundy pressed | `#6F1526` |
| ink | `#4A4038` |
| muted ink | `#8C7C64` |
| radius (cards) | 22px |
| radius (fields) | 12px |
| pill | 999px |
| card shadow | `0 24px 50px -30px rgba(126,104,76,.5)` |
| kicker | 10–11px / .44em / uppercase |
| body | 17px Lora or Cormorant / 1.6 |
| display names | 62px / .94 |

Platform tokens come from `_ds/classical-*/styles.css` — link that stylesheet and use its variables; never hard-code its hexes.

## Assets

- `design/assets/` — flap-left.jpg, flap-right.jpg (envelope halves), seal.png (transparent oval wax seal), floral.jpg (repeating floral ground). Derived from a customer-supplied photograph; ship them as template-01 assets under object storage, not in the repo bundle, once real templates exist.
- Fonts: Cormorant Garamond + Lora (Google Fonts, self-host in production).
- Icons: Lucide.

## Files in this bundle

```
design_handoff_nivora/
  README.md              ← this file
  ARCHITECTURE.md        ← folders, providers, jobs, security
  api-spec.md            ← REST surface
  seed-data.md           ← services, plans, templates, music
  .env.example
  prisma/schema.prisma
  design/Invitation-Islem-Akram.html   ← hifi reference, opens in any browser
  design/assets/*                      ← images used by it
```
