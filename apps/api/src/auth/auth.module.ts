import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { EmailsModule } from "../emails/emails.module.js";

// JwtService comes from the global JwtModule registered in AppModule.
@Module({
  imports: [EmailsModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
