import type { Currency } from "@nivora/shared";

export interface WebhookEvent {
  type: "checkout.completed" | "checkout.failed" | "refund.completed";
  providerRef: string;
  orderReference?: string;
  amount?: number;
  currency?: Currency;
  raw: unknown;
}

/**
 * One adapter per provider. Selection is by env var (PAYMENT_PROVIDER),
 * resolved in PAYMENT_PROVIDER_TOKEN's factory. Adding a provider = one
 * adapter file + one entry in the factory switch.
 */
export interface PaymentProvider {
  readonly key: "stripe" | "paypal" | "konnect" | "mock";

  createCheckout(input: {
    orderId: string;
    amount: number;
    currency: Currency;
    customerEmail: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ checkoutUrl: string; providerRef: string }>;

  verifyWebhook(rawBody: Buffer, signature: string): Promise<WebhookEvent>;

  refund(providerRef: string, amount?: number): Promise<{ refundRef: string }>;
}

export const PAYMENT_PROVIDER_TOKEN = "PAYMENT_PROVIDER_TOKEN";
