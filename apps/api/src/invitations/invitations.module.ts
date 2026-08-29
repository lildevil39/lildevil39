import { Module } from "@nestjs/common";
import { InvitationsController, WishesController } from "./invitations.controller.js";
import { PublicInvitationsController } from "./public-invitations.controller.js";
import { InvitationsService } from "./invitations.service.js";

@Module({
  controllers: [InvitationsController, WishesController, PublicInvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
