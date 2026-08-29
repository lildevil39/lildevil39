import { Inject, Injectable, NotImplementedException } from "@nestjs/common";
import type { CheckoutDto } from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import { PAYMENT_PROVIDER_TOKEN, type PaymentProvider } from "./payment-provider.interface.js";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER_TOKEN) private readonly provider: PaymentProvider,
  ) {}

  createCheckout(_userId: string, _dto: CheckoutDto) {
    throw new NotImplementedException(
      "payments.createCheckout: TODO — load order, call provider.createCheckout, persist Payment row (status=INITIATED)",
    );
  }

  /**
   * The webhook — not the browser redirect — is what flips the order to PAID.
   * Must verify signature, dedupe by event id, and never leak provider internals.
   */
  handleWebhook(_provider: string, _rawBody: Buffer, _signature: string) {
    throw new NotImplementedException(
      "payments.handleWebhook: TODO — provider.verifyWebhook, dedupe by event id, update Payment + Order, enqueue GenerationJob",
    );
  }

  listForUser(userId: string) {
    return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }
}
