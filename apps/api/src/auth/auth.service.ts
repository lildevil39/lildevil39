import { Injectable, NotImplementedException } from "@nestjs/common";
import type { Request, Response } from "express";
import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";

/**
 * argon2id hashing, 15 min access JWT (in memory on the client), 30 day
 * refresh token rotated on use and stored httpOnly/Secure/SameSite=Lax,
 * revocable per `sessions` row. Email verification required before payment.
 * See ARCHITECTURE.md § Security checklist.
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(_dto: RegisterDto) {
    throw new NotImplementedException("auth.register: TODO — hash password, create User + UserProfile, send verification email");
  }

  async login(_dto: LoginDto, _res: Response) {
    throw new NotImplementedException("auth.login: TODO — verify password, issue access token, set refresh cookie");
  }

  async refresh(_req: Request, _res: Response) {
    throw new NotImplementedException("auth.refresh: TODO — verify + rotate refresh cookie, issue new access token");
  }

  async logout(_user: { id: string }, _res: Response) {
    throw new NotImplementedException("auth.logout: TODO — revoke session row, clear cookie");
  }

  async verifyEmail(_dto: VerifyEmailDto) {
    throw new NotImplementedException("auth.verifyEmail: TODO — consume single-use token");
  }

  async resendVerification(_email: string) {
    throw new NotImplementedException("auth.resendVerification: TODO — throttled 1/min");
  }

  async forgotPassword(_dto: ForgotPasswordDto) {
    // Always resolves — never reveals whether the email exists.
    return;
  }

  async resetPassword(_dto: ResetPasswordDto) {
    throw new NotImplementedException("auth.resetPassword: TODO — consume single-use token, rehash password");
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }
}
