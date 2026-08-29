import { createHash, randomBytes } from "node:crypto";
import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";
import type { Request, Response } from "express";
import type {
  ForgotPasswordDto,
  Locale,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import { EmailsService } from "../emails/emails.service.js";

const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_PATH = "/api/v1/auth";
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30d — matches JWT_REFRESH_TTL default
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30min, per README § Auth

/** Tokens are already high-entropy random bytes, so sha256 (not argon2) is enough to store them hashed. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * argon2id password hashing, 15 min access JWT (in memory on the client), 30 day
 * refresh token rotated on use and stored httpOnly/Secure/SameSite=Lax,
 * revocable per `sessions` row. Email verification required before payment.
 * See ARCHITECTURE.md § Security checklist.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly emails: EmailsService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException({
        code: "EMAIL_TAKEN",
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await argonHash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        locale: dto.locale,
        profile: { create: { firstName: dto.firstName, lastName: dto.lastName } },
      },
    });

    await this.issueVerificationEmail(user.id, user.email, user.locale);

    return { id: user.id, email: user.email };
  }

  async login(dto: LoginDto, req: Request, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !(await argonVerify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }
    if (user.status !== "ACTIVE") {
      throw new UnauthorizedException({
        code: "ACCOUNT_SUSPENDED",
        message: "This account has been suspended",
      });
    }

    const accessToken = await this.signAccessToken(user.id, user.email, user.role);
    await this.issueRefreshCookie(user.id, req, res);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerifiedAt: user.emailVerifiedAt,
      },
    };
  }

  async refresh(req: Request, res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (!raw) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Missing refresh token" });
    }

    const session = await this.prisma.session.findUnique({
      where: { refreshTokenHash: hashToken(raw) },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: "Invalid or expired refresh token",
      });
    }

    // Rotate: this token is now dead whether or not the rest of the call succeeds.
    await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "User no longer exists" });
    }

    const accessToken = await this.signAccessToken(user.id, user.email, user.role);
    await this.issueRefreshCookie(user.id, req, res);

    return { accessToken };
  }

  async logout(req: Request, res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE];
    if (raw) {
      await this.prisma.session.updateMany({
        where: { refreshTokenHash: hashToken(raw), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const record = await this.prisma.authToken.findUnique({
      where: { tokenHash: hashToken(dto.token) },
    });
    if (!record || record.type !== "EMAIL_VERIFY" || record.usedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: "INVALID_TOKEN",
        message: "Invalid or expired verification token",
      });
    }

    await this.prisma.$transaction([
      this.prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    ]);
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerifiedAt) return; // never reveal existence or already-verified state
    await this.issueVerificationEmail(user.id, user.email, user.locale);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return; // always resolves — never reveals whether the email exists

    const token = generateToken();
    await this.prisma.authToken.create({
      data: {
        userId: user.id,
        type: "PASSWORD_RESET",
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });
    await this.emails.send("password-reset", user.email, { token }, user.locale);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.authToken.findUnique({
      where: { tokenHash: hashToken(dto.token) },
    });
    if (
      !record ||
      record.type !== "PASSWORD_RESET" ||
      record.usedAt ||
      record.expiresAt < new Date()
    ) {
      throw new UnauthorizedException({
        code: "INVALID_TOKEN",
        message: "Invalid or expired reset token",
      });
    }

    const passwordHash = await argonHash(dto.password);
    await this.prisma.$transaction([
      this.prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      // A password reset should log out every other session, not just rotate this one.
      this.prisma.session.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      // Never select passwordHash — this response goes straight to the client.
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
    });
  }

  private signAccessToken(id: string, email: string, role: string) {
    return this.jwt.signAsync(
      { sub: id, id, email, role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: process.env.JWT_ACCESS_TTL ?? "15m" },
    );
  }

  private async issueRefreshCookie(userId: string, req: Request, res: Response) {
    const token = generateToken();
    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: hashToken(token),
        userAgent: req.headers["user-agent"],
        ip: req.ip,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.COOKIE_DOMAIN,
      path: REFRESH_COOKIE_PATH,
      maxAge: REFRESH_TTL_MS,
    });
  }

  private async issueVerificationEmail(userId: string, email: string, locale: Locale) {
    const token = generateToken();
    await this.prisma.authToken.create({
      data: {
        userId,
        type: "EMAIL_VERIFY",
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
      },
    });
    await this.emails.send("verify-email", email, { token }, locale);
  }
}
