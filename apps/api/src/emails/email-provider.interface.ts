import type { Locale } from "@nivora/shared";

export type EmailTemplate =
  | "verify-email"
  | "welcome"
  | "password-reset"
  | "payment-succeeded"
  | "project-ready"
  | "project-failed"
  | "new-rsvp"
  | "new-wish";

export interface EmailProvider {
  readonly key: "resend" | "sendgrid" | "console";
  send(template: EmailTemplate, to: string, vars: Record<string, unknown>, locale: Locale): Promise<void>;
}

export const EMAIL_PROVIDER_TOKEN = "EMAIL_PROVIDER_TOKEN";
