import { Inject, Injectable } from "@nestjs/common";
import type { Locale } from "@nivora/shared";
import { EMAIL_PROVIDER_TOKEN, type EmailProvider, type EmailTemplate } from "./email-provider.interface.js";

@Injectable()
export class EmailsService {
  constructor(@Inject(EMAIL_PROVIDER_TOKEN) private readonly provider: EmailProvider) {}

  send(template: EmailTemplate, to: string, vars: Record<string, unknown> = {}, locale: Locale = "FR") {
    return this.provider.send(template, to, vars, locale);
  }
}
