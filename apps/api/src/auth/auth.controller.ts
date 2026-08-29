import { Body, Controller, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@nivora/shared";
import { Public } from "../common/decorators/public.decorator.js";
import { CurrentUser, type AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { AuthService } from "./auth.service.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post("register")
  register(@Body(new ZodValidationPipe(registerSchema)) dto: unknown) {
    return this.auth.register(dto as never);
  }

  @Public()
  @Post("login")
  login(
    @Body(new ZodValidationPipe(loginSchema)) dto: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.login(dto as never, res);
  }

  @Public()
  @Post("refresh")
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.auth.refresh(req, res);
  }

  @Post("logout")
  @HttpCode(204)
  logout(@CurrentUser() user: AuthenticatedUser, @Res({ passthrough: true }) res: Response) {
    return this.auth.logout(user, res);
  }

  @Public()
  @Post("verify-email")
  verifyEmail(@Body(new ZodValidationPipe(verifyEmailSchema)) dto: unknown) {
    return this.auth.verifyEmail(dto as never);
  }

  @Public()
  @Post("resend-verification")
  @HttpCode(204)
  resendVerification(@Body() body: { email: string }) {
    return this.auth.resendVerification(body.email);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(204)
  forgotPassword(@Body(new ZodValidationPipe(forgotPasswordSchema)) dto: unknown) {
    return this.auth.forgotPassword(dto as never);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(204)
  resetPassword(@Body(new ZodValidationPipe(resetPasswordSchema)) dto: unknown) {
    return this.auth.resetPassword(dto as never);
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.me(user.id);
  }
}
