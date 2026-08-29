# NIVORA — architecture

Monorepo, pnpm workspaces + Turborepo.

```
nivora/
  apps/
    api/                      NestJS 10 + TypeScript
      src/
        main.ts
        app.module.ts
        common/               guards, interceptors, filters, decorators, pipes
        config/               typed ConfigModule schemas (zod)
        prisma/               PrismaModule + PrismaService
        auth/                 register, login, refresh, verify-email, password reset
        users/                profile, settings
        services/             service catalogue + plans + pricing
        projects/             generic project CRUD, ownership guard
        invitations/          wedding invitation domain + public read + RSVP + wishes
        videos/               video projects, scenes, generation jobs
        cv/
        business-cards/
        logos/
        branding/
        orders/
        payments/             PaymentService + provider adapters + webhooks
        uploads/              StorageService + signed URLs + validation
        notifications/
        emails/               EmailService + templates
        jobs/                 GenerationJob queue abstraction
        admin/                admin-only controllers
      prisma/schema.prisma
      test/
    web/                      React 18 + TypeScript + Vite
      src/
        api/                  generated client + fetch wrapper (auth refresh)
        components/           ui/, forms/, layout/, invitation/
        pages/                landing, auth, dashboard, create, invite, admin
        layouts/              PublicLayout, DashboardLayout, AdminLayout, InviteLayout
        hooks/
        services/
        types/
        utils/
        i18n/                 fr.json, en.json (+ ar.json for invitation content)
  packages/
    shared/                   zod schemas + TS types shared by api and web
    config/                   eslint, tsconfig, prettier
  docker-compose.yml          postgres + redis + minio (local dev)
  README.md
```

## Backend conventions

- Every controller method: DTO validated by `ZodValidationPipe` (schemas from `packages/shared`), explicit response type, OpenAPI decorators.
- `JwtAuthGuard` global; opt out with `@Public()`. `RolesGuard` + `@Roles('ADMIN')`.
- `ProjectOwnerGuard` — loads the project and 404s (not 403) when `project.userId !== user.id` unless the caller is admin. Applied to every project-scoped route.
- Errors through a global `HttpExceptionFilter` returning `{ statusCode, code, message, details? }`. Never leak Prisma errors.
- Logging: `nestjs-pino`, request id per call, PII redacted.
- All money in **integer minor units** + a currency code. Never floats.

## Provider abstractions

Each is an injectable interface with a dev/mock implementation registered when no provider is configured. The mock must be *honest*: it succeeds locally but marks results `provider: 'mock'`, and any user-facing state says "en attente de configuration" rather than pretending.

```ts
// payments/payment.service.ts
export interface PaymentProvider {
  readonly key: 'stripe' | 'paypal' | 'konnect' | 'mock';
  createCheckout(input: { orderId: string; amount: number; currency: 'TND'|'EUR';
    customerEmail: string; successUrl: string; cancelUrl: string }): Promise<{ checkoutUrl: string; providerRef: string }>;
  verifyWebhook(rawBody: Buffer, signature: string): Promise<WebhookEvent>;
  refund(providerRef: string, amount?: number): Promise<{ refundRef: string }>;
}
```

Same shape for:

- `StorageProvider` — `getUploadUrl`, `getSignedReadUrl`, `delete`, `copy`. Adapters: S3-compatible, Cloudinary, Supabase Storage, local disk (dev). DB stores metadata + key only.
- `EmailProvider` — `send(template, to, vars, locale)`. Adapters: Resend, SendGrid, console (dev).
- `ImageGenerationProvider`, `VideoGenerationProvider`, `LogoGenerationProvider` — all extend a base `AIProvider` with `submit(input): Promise<{ providerJobId }>` and `poll(providerJobId): Promise<{ status; outputs?; error? }>`. **No provider is bundled.** With none configured, `submit` throws `ProviderNotConfiguredException`; the job row goes to `FAILED` with `error: 'AI provider not configured'` and the dashboard shows exactly that.

Selection is by env var (`PAYMENT_PROVIDER=stripe`), resolved in a factory provider. Adding a provider = one adapter file + one enum entry.

## Generation job system

`generation_jobs` rows are the single source of truth for async work. Interface `JobQueue` with two implementations: `InProcessQueue` (dev; setTimeout + DB polling) and `BullMqQueue` (prod; Redis). Worker resolves the right AI provider, updates status `QUEUED → PROCESSING → COMPLETED|FAILED`, writes outputs to storage, creates a notification, sends an email. Idempotent by `(projectId, type, inputHash)`.

Wedding invitations do **not** need AI: "generation" = validate required fields, allocate a unique slug, snapshot the render payload, set `publishedAt`. Synchronous, sub-second.

## Security checklist

- argon2id password hashing (`@node-rs/argon2`), never bcrypt with default cost.
- Access JWT 15 min in memory; refresh token 30 days in an httpOnly, Secure, SameSite=Lax cookie, rotated on use, revocable per session row.
- Email verification required before payment; password reset tokens single-use, 30 min TTL, hashed at rest.
- `helmet`, strict CORS allowlist from env, `@nestjs/throttler` (global 100/min; auth routes 5/min per IP + per email).
- Uploads: magic-byte sniffing (not just extension), max 10 MB images / 20 MB audio, images re-encoded via sharp to strip EXIF, filenames replaced with UUIDs, all private objects served through short-lived signed URLs. Public invitation assets go to a separate public bucket prefix at publish time.
- Never store card numbers, CVV or raw payment data — hosted checkout + tokenization only. Webhooks verified by signature, replay-protected by event id.
- Row-level ownership checks on every read and write; slugs are unguessable for unpublished projects.
- Secrets only from env; `.env` git-ignored; `.env.example` documents every key with no real values.

## Testing & tooling

Vitest + Supertest for API (auth, ownership, payment webhook, RSVP), Playwright for the customer journey end-to-end, Prisma seed for realistic dev data, GitHub Actions: lint → typecheck → test → build.
