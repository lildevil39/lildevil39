import { Body, Controller, Get, Headers, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { checkoutSchema } from "@nivora/shared";
import { Public } from "../common/decorators/public.decorator.js";
import { CurrentUser, type AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { PaymentsService } from "./payments.service.js";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post("checkout")
  checkout(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(checkoutSchema)) dto: unknown) {
    return this.payments.createCheckout(user.id, dto as never);
  }

  /**
   * Public, signature-verified, replay-protected by event id. `req.body` is
   * the raw Buffer here — see main.ts's express.raw() mount for this path.
   */
  @Public()
  @Post("webhook/:provider")
  webhook(
    @Param("provider") provider: string,
    @Req() req: Request,
    @Headers("stripe-signature") stripeSig?: string,
    @Headers("x-webhook-signature") genericSig?: string,
  ) {
    const signature = stripeSig ?? genericSig ?? "";
    return this.payments.handleWebhook(provider, req.body as Buffer, signature);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.payments.listForUser(user.id);
  }
}
