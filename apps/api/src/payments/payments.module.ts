import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller.js";
import { PaymentsService } from "./payments.service.js";
import { PAYMENT_PROVIDER_TOKEN } from "./payment-provider.interface.js";
import { MockPaymentProvider } from "./providers/mock-payment.provider.js";

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MockPaymentProvider,
    {
      provide: PAYMENT_PROVIDER_TOKEN,
      useFactory: (mock: MockPaymentProvider) => {
        const provider = process.env.PAYMENT_PROVIDER ?? "mock";
        switch (provider) {
          case "mock":
            return mock;
          // case "stripe": return new StripePaymentProvider(...);
          // case "paypal": return new PaypalPaymentProvider(...);
          // case "konnect": return new KonnectPaymentProvider(...);
          default:
            // eslint-disable-next-line no-console
            console.warn(`PAYMENT_PROVIDER=${provider} has no adapter yet, falling back to mock`);
            return mock;
        }
      },
      inject: [MockPaymentProvider],
    },
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
