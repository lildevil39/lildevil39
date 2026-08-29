import { z } from "zod";

/**
 * Typed, validated environment. Fails fast on boot if a required var is
 * missing — see .env.example at the repo root for every key.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(3000),
  WEB_URL: z.string().url().default("http://localhost:5173"),
  API_URL: z.string().url().default("http://localhost:3000"),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_TTL: z.string().default("30d"),
  COOKIE_DOMAIN: z.string().default("localhost"),

  STORAGE_PROVIDER: z.enum(["local", "s3", "cloudinary", "supabase"]).default("local"),
  STORAGE_LOCAL_DIR: z.string().default("./.storage"),
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_PUBLIC_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),

  PAYMENT_PROVIDER: z.enum(["mock", "stripe", "paypal", "konnect"]).default("mock"),
  DEFAULT_CURRENCY: z.enum(["TND", "EUR"]).default("TND"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  KONNECT_API_KEY: z.string().optional(),
  KONNECT_WALLET_ID: z.string().optional(),

  EMAIL_PROVIDER: z.enum(["console", "resend", "sendgrid"]).default("console"),
  EMAIL_FROM: z.string().default("NIVORA <no-reply@nivora.tn>"),
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),

  IMAGE_PROVIDER: z.string().optional(),
  VIDEO_PROVIDER: z.string().optional(),
  LOGO_PROVIDER: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  AI_API_BASE_URL: z.string().optional(),
  AI_WEBHOOK_SECRET: z.string().optional(),

  QUEUE_DRIVER: z.enum(["inprocess", "bullmq"]).default("inprocess"),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  UPLOAD_MAX_IMAGE_MB: z.coerce.number().default(10),
  UPLOAD_MAX_AUDIO_MB: z.coerce.number().default(20),
  RATE_LIMIT_PER_MIN: z.coerce.number().default(100),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${result.error.toString()}`);
  }
  return result.data;
}
