import { Injectable } from "@nestjs/common";
import type { Locale } from "@nivora/shared";
import type { EmailProvider, EmailTemplate } from "../email-provider.interface.js";

/** Dev-only adapter — logs instead of sending. Registered when EMAIL_PROVIDER=console (default). */
@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
  readonly key = "console" as const;

  async send(
    template: EmailTemplate,
    to: string,
    vars: Record<string, unknown>,
    locale: Locale,
  ): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[email:console] ${template} -> ${to} (${locale})`, vars);
  }
}
