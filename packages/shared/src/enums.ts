/**
 * Mirrors the enums in apps/api/prisma/schema.prisma.
 * Keep in sync by hand — Prisma's generated enums are the source of truth
 * on the API side; this copy is what the web app imports without pulling
 * in the Prisma client.
 */

export const ROLES = ["CUSTOMER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const LOCALES = ["FR", "EN", "AR"] as const;
export type Locale = (typeof LOCALES)[number];

export const CURRENCIES = ["TND", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PLAN_TIERS = ["STARTER", "PREMIUM"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const PROJECT_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "PROCESSING",
  "READY",
  "FAILED",
  "ARCHIVED",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["INITIATED", "SUCCEEDED", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FILE_KINDS = [
  "PHOTO",
  "GALLERY",
  "BACKGROUND",
  "MUSIC",
  "LOGO",
  "DOCUMENT",
  "OUTPUT",
] as const;
export type FileKind = (typeof FILE_KINDS)[number];

export const ATTENDANCE = ["YES", "NO", "MAYBE"] as const;
export type Attendance = (typeof ATTENDANCE)[number];

export const MODERATION_STATES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ModerationState = (typeof MODERATION_STATES)[number];

export const JOB_TYPES = [
  "INVITATION_RENDER",
  "VIDEO_GENERATE",
  "LOGO_GENERATE",
  "BRAND_GENERATE",
  "CV_PDF",
  "CARD_RENDER",
] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = ["QUEUED", "PROCESSING", "COMPLETED", "FAILED"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const SERVICE_KEYS = [
  "wedding-invitation",
  "wedding-video",
  "cv",
  "business-card",
  "logo",
  "brand-identity",
] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];
