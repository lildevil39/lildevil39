# NIVORA — REST API

Base `/api/v1`. JSON. Auth via `Authorization: Bearer <accessToken>`; refresh via httpOnly cookie.
Errors: `{ statusCode, code, message, details? }`. Lists: `?page=1&perPage=20&sort=-createdAt` → `{ data, meta: { page, perPage, total } }`.

## Auth
| Method | Path | Body / notes |
| --- | --- | --- |
| POST | `/auth/register` | `{ email, password, firstName, lastName, locale }` → sends verification email |
| POST | `/auth/login` | `{ email, password }` → `{ accessToken, user }` + refresh cookie |
| POST | `/auth/refresh` | cookie only → new access token (rotates refresh) |
| POST | `/auth/logout` | revokes the session |
| POST | `/auth/verify-email` | `{ token }` |
| POST | `/auth/resend-verification` | throttled 1/min |
| POST | `/auth/forgot-password` | `{ email }` — always 204, never reveals existence |
| POST | `/auth/reset-password` | `{ token, password }` |
| GET | `/auth/me` | current user + roles + profile |

## Catalogue (public)
`GET /services` · `GET /services/:key` (plans, prices in TND+EUR, features) · `GET /services/:key/templates` · `GET /music?tag=` · `POST /coupons/validate` `{ code, serviceKey, amount }`

## Projects
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/projects` | own projects, filter `?service=&status=` |
| POST | `/projects` | `{ serviceKey, planTier }` → DRAFT project |
| GET | `/projects/:id` | ownership guard |
| PATCH | `/projects/:id` | partial autosave; `{ step, data }` merged into the typed child record |
| DELETE | `/projects/:id` | soft delete, drafts only |
| POST | `/projects/:id/duplicate` | |
| GET | `/projects/:id/preview` | normalized render payload the live preview consumes |
| POST | `/projects/:id/submit` | validates required fields → creates order → returns `{ orderId }` |

Service-specific sub-resources (all under ownership guard):
`PUT /projects/:id/invitation` · `PUT /projects/:id/invitation/events` · `PUT /projects/:id/video` · `PUT /projects/:id/video/scenes` · `PUT /projects/:id/cv` · `PUT /projects/:id/business-card` · `PUT /projects/:id/logo` · `PUT /projects/:id/brand`

## Uploads
`POST /uploads/sign` `{ projectId, kind: 'photo'|'music'|'logo'|'document', mimeType, sizeBytes }` → `{ uploadUrl, fileId, key }` (client PUTs directly to storage) · `POST /uploads/:fileId/complete` · `PATCH /uploads/:fileId` (alt text, sort order) · `DELETE /uploads/:fileId`

## Orders & payments
`POST /orders` `{ projectId, planTier, couponCode? }` (price snapshot server-side; body prices are ignored) · `GET /orders` · `GET /orders/:id` · `POST /orders/:id/cancel`
`POST /payments/checkout` `{ orderId, provider? }` → `{ checkoutUrl }` · `POST /payments/webhook/:provider` (raw body, signature-verified, public) · `GET /payments` (own payments)

## Publish & public invitation
`POST /projects/:id/publish` → `{ slug, url }` (order must be PAID) · `POST /projects/:id/unpublish`
Public, no auth: `GET /public/invitations/:slug` · `POST /public/invitations/:slug/rsvp` `{ name, guests, attendance: 'YES'|'NO'|'MAYBE', message? }` (throttled 5/hour/IP, honeypot field) · `POST /public/invitations/:slug/wishes` `{ name, message }` (moderated: `status=PENDING` until owner approves) · `GET /public/invitations/:slug/wishes` (approved only)

Owner views: `GET /projects/:id/rsvps` (+ `?export=csv`) · `GET /projects/:id/rsvps/stats` → `{ confirmed, declined, maybe, pending, guestsTotal }` · `PATCH /wishes/:id` `{ status }`

## Generation jobs
`POST /projects/:id/generate` `{ type }` → `{ jobId }` (409 if no provider configured for that type) · `GET /jobs/:id` · `GET /projects/:id/jobs`

## Notifications
`GET /notifications` · `POST /notifications/:id/read` · `POST /notifications/read-all`

## Admin (`@Roles('ADMIN')`)
`GET /admin/stats` · `GET /admin/users` · `PATCH /admin/users/:id` (role, status) · `GET /admin/projects` · `GET /admin/orders` · `PATCH /admin/orders/:id` (status) · `POST /admin/payments/:id/refund` · CRUD `/admin/templates`, `/admin/music`, `/admin/coupons`, `/admin/services/:key/plans` (prices) · `GET /admin/audit-log`
