# Seed data (development)

## Roles
`CUSTOMER`, `ADMIN`.

## Users
- `admin@nivora.tn` / `Nivora!Admin2026` — ADMIN, verified
- `hazem@example.com` / `Password!2026` — CUSTOMER, verified, 2 active + 5 completed projects, 1 pending payment
- `islem@example.com` — CUSTOMER, one published invitation (`islem-akram-2027`) with 47 RSVPs

## Services and plans (prices in minor units)

| serviceKey | tier | TND | EUR | includes |
| --- | --- | --- | --- | --- |
| wedding-invitation | STARTER | 79000 | 2500 | 1 template, 50 RSVP, musique bibliothèque |
| wedding-invitation | PREMIUM | 149000 | 4500 | tous templates, RSVP illimité, musique personnalisée, galerie, vœux |
| wedding-video | STARTER | 129000 | 4000 | 30 s, 1 style, 10 photos |
| wedding-video | PREMIUM | 249000 | 7500 | 60 s, tous styles, 30 photos, révisions |
| cv | STARTER | 39000 | 1200 | 1 template, PDF |
| cv | PREMIUM | 69000 | 2100 | tous templates, PDF + lien public, relecture |
| business-card | STARTER | 29000 | 900 | carte digitale, QR |
| business-card | PREMIUM | 49000 | 1500 | + fichiers impression, logo intégré |
| logo | STARTER | 99000 | 3000 | 3 propositions, PNG/SVG |
| logo | PREMIUM | 199000 | 6000 | 6 propositions, déclinaisons, sources |
| brand-identity | STARTER | 299000 | 9000 | logo, palette, typo, guide court |
| brand-identity | PREMIUM | 599000 | 18000 | + carte de visite, réseaux sociaux, guide complet |

TND has 3 minor units (millimes); EUR has 2. Store `currency` alongside `amount` and format per locale.

## Invitation templates
| code | name | palette |
| --- | --- | --- |
| INV-01 | Elegant Ivory | ivory #F7F2EA, champagne #C9B392, burgundy #8A1C30 |
| INV-02 | Luxury Gold | cream #F6F1E7, gold #B68235, ink #201F1D |
| INV-03 | Minimal White | white #FCFCFB, greige #D8D3CA, charcoal #2E2C29 |
| INV-04 | Floral Rose | blush #F8EFEC, dusty rose #B9868A, sage #8B9484 |
| INV-05 | Modern Black & Gold | near-black #14120F, gold #C9A227, bone #EDE7DA |

INV-01 is the design in `design/Invitation-Islem-Akram.html` and ships with its flap / seal / floral assets.

## Video styles
Elegant, Luxury, Romantic, Cinematic, Minimal, Modern.

## CV templates
Modern, Minimal, Corporate, Creative, Executive.

## Music library
Seed 6 tracks. **Only licence-clear audio** — CC0 / CC-BY with attribution stored in `music.license` and `music.attribution`, or tracks the studio owns. Never bundle commercial recordings. Fields: `title, artist, durationSec, license, attribution, storageKey, previewKey, tags[]`.

## Coupons
`LANCEMENT20` — 20 %, all services, expires in 60 days, 100 uses.
`MARIAGE10` — 10 %, wedding services only, 500 uses.
