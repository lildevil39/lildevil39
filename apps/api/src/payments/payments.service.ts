import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CheckoutDto } from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  PAYMENT_PROVIDER_TOKEN,
  type PaymentProvider,
  type WebhookEvent,
} from "./payment-provider.interface.js";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER_TOKEN) private readonly provider: PaymentProvider,
  ) {}

  async createCheckout(userId: string, dto: CheckoutDto) {
    const order = await this.prisma.order.findFirst({ where: { id: dto.orderId, userId } });
    if (!order) throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    if (order.status !== "PENDING_PAYMENT") {
      throw new ConflictException({
        code: "ORDER_NOT_PAYABLE",
        message: `Order is ${order.status}, not pending payment`,
      });
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const webUrl = process.env.WEB_URL ?? "http://localhost:5173";

    const { checkoutUrl, providerRef } = await this.provider.createCheckout({
      orderId: order.id,
      amount: order.total,
      currency: order.currency,
      customerEmail: user.email,
      successUrl: `${webUrl}/dashboard/orders/${order.id}?paid=1`,
      cancelUrl: `${webUrl}/dashboard/orders/${order.id}?cancelled=1`,
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        userId,
        provider: this.provider.key,
        providerRef,
        amount: order.total,
        currency: order.currency,
        status: "INITIATED",
      },
    });

    if (this.provider.key === "mock") {
      // A fake provider will never call our webhook back from the outside,
      // so the mock path finalizes the payment right here instead of
      // leaving it stuck at INITIATED forever. Any real provider still goes
      // through handleWebhook exactly as documented there.
      await this.finalizePayment(providerRef, {
        type: "checkout.completed",
        providerRef,
        raw: { mock: true },
      });
    }

    return { checkoutUrl };
  }

  /**
   * The webhook — not the browser redirect — is what flips the order to PAID.
   * Signature verification happens inside provider.verifyWebhook(); dedupe
   * is handled by finalizePayment() only acting on payments still INITIATED.
   */
  async handleWebhook(_providerKey: string, rawBody: Buffer, signature: string) {
    const event = await this.provider.verifyWebhook(rawBody, signature);
    await this.finalizePayment(event.providerRef, event);
    return { received: true };
  }

  private async finalizePayment(providerRef: string, event: WebhookEvent) {
    const payment = await this.prisma.payment.findUnique({
      where: { providerRef },
      include: { order: { include: { project: { include: { service: true } } } } },
    });
    // Unknown ref, or already processed (replay/duplicate webhook) — no-op, not an error.
    if (!payment || payment.status !== "INITIATED") return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCEEDED", rawEvent: event.raw as never },
    });
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID", paidAt: new Date() },
    });

    // Wedding invitations render synchronously (no AI/queue involved) — ready immediately.
    // Everything else needs an AI provider that isn't configured yet, so it waits in PROCESSING.
    await this.prisma.project.update({
      where: { id: payment.order.projectId },
      data: { status: payment.order.project.service.key === "wedding-invitation" ? "READY" : "PROCESSING" },
    });

    await this.prisma.notification.create({
      data: {
        userId: payment.userId,
        type: "PAYMENT_SUCCEEDED",
        title: "Paiement reçu",
        body: `Commande ${payment.order.reference}`,
      },
    });
  }

  listForUser(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }
}
