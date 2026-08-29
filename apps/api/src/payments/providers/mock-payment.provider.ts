import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { PaymentProvider, WebhookEvent } from "../payment-provider.interface.js";

/**
 * Local-dev provider. Succeeds immediately and marks results provider:'mock'
 * so nothing pretends to be a real payment. Registered when PAYMENT_PROVIDER
 * is unset or 'mock'.
 */
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  readonly key = "mock" as const;

  async createCheckout(input: {
    orderId: string;
    successUrl: string;
  }): Promise<{ checkoutUrl: string; providerRef: string }> {
    const providerRef = `mock_${randomUUID()}`;
    // In dev this could redirect straight to successUrl with a query flag;
    // left as a TODO so the checkout UI can render an explicit mock screen.
    return { checkoutUrl: `${input.successUrl}?mock=1&ref=${providerRef}`, providerRef };
  }

  async verifyWebhook(rawBody: Buffer): Promise<WebhookEvent> {
    const parsed = JSON.parse(rawBody.toString("utf8"));
    return {
      type: parsed.type ?? "checkout.completed",
      providerRef: parsed.providerRef ?? `mock_${randomUUID()}`,
      orderReference: parsed.orderReference,
      raw: parsed,
    };
  }

  async refund(providerRef: string): Promise<{ refundRef: string }> {
    return { refundRef: `mock_refund_${providerRef}` };
  }
}
