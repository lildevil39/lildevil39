import { Module } from "@nestjs/common";
import { EmailsService } from "./emails.service.js";
import { EMAIL_PROVIDER_TOKEN } from "./email-provider.interface.js";
import { ConsoleEmailProvider } from "./providers/console-email.provider.js";

@Module({
  providers: [
    EmailsService,
    ConsoleEmailProvider,
    {
      provide: EMAIL_PROVIDER_TOKEN,
      useFactory: (dev: ConsoleEmailProvider) => {
        const provider = process.env.EMAIL_PROVIDER ?? "console";
        switch (provider) {
          case "console":
            return dev;
          // case "resend": return new ResendEmailProvider(...);
          // case "sendgrid": return new SendgridEmailProvider(...);
          default:
            // eslint-disable-next-line no-console
            console.warn(`EMAIL_PROVIDER=${provider} has no adapter yet, falling back to console`);
            return dev;
        }
      },
      inject: [ConsoleEmailProvider],
    },
  ],
  exports: [EmailsService],
})
export class EmailsModule {}
