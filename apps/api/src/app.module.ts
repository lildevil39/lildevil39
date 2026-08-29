import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { JwtModule } from "@nestjs/jwt";

import { validateEnv } from "./config/env.schema.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard.js";

import { AuthModule } from "./auth/auth.module.js";
import { UsersModule } from "./users/users.module.js";
import { ServicesModule } from "./services/services.module.js";
import { ProjectsModule } from "./projects/projects.module.js";
import { InvitationsModule } from "./invitations/invitations.module.js";
import { VideosModule } from "./videos/videos.module.js";
import { CvModule } from "./cv/cv.module.js";
import { BusinessCardsModule } from "./business-cards/business-cards.module.js";
import { LogosModule } from "./logos/logos.module.js";
import { BrandingModule } from "./branding/branding.module.js";
import { OrdersModule } from "./orders/orders.module.js";
import { PaymentsModule } from "./payments/payments.module.js";
import { UploadsModule } from "./uploads/uploads.module.js";
import { NotificationsModule } from "./notifications/notifications.module.js";
import { EmailsModule } from "./emails/emails.module.js";
import { JobsModule } from "./jobs/jobs.module.js";
import { AdminModule } from "./admin/admin.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
        redact: ["req.headers.authorization", "req.headers.cookie"],
        genReqId: (req) => req.headers["x-request-id"] ?? crypto.randomUUID(),
      },
    }),
    ThrottlerModule.forRoot([
      { name: "default", ttl: 60_000, limit: Number(process.env.RATE_LIMIT_PER_MIN ?? 100) },
    ]),
    // Global JwtModule so JwtAuthGuard can inject JwtService anywhere; AuthModule re-registers
    // its own instance with the same secret for token issuance.
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_TTL ?? "15m" },
    }),
    PrismaModule,

    AuthModule,
    UsersModule,
    ServicesModule,
    ProjectsModule,
    InvitationsModule,
    VideosModule,
    CvModule,
    BusinessCardsModule,
    LogosModule,
    BrandingModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
    NotificationsModule,
    EmailsModule,
    JobsModule,
    AdminModule,
  ],
  providers: [
    // JwtAuthGuard is global; opt out per-route with @Public().
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
