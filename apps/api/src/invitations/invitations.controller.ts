import { Body, Controller, Get, Param, Patch, Put, Query, UseGuards } from "@nestjs/common";
import { weddingEventSchema, weddingInvitationSchema } from "@nivora/shared";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { ProjectOwnerGuard } from "../common/guards/project-owner.guard.js";
import { CurrentUser, type AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { InvitationsService } from "./invitations.service.js";

/** Owner-side: edit form + RSVP/wishes moderation for one project. */
@UseGuards(ProjectOwnerGuard)
@Controller("projects/:id")
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Put("invitation")
  upsert(@Param("id") id: string, @Body(new ZodValidationPipe(weddingInvitationSchema)) dto: unknown) {
    return this.invitations.upsert(id, dto as never);
  }

  @Put("invitation/events")
  upsertEvents(@Param("id") id: string, @Body(new ZodValidationPipe(weddingEventSchema.array())) dto: unknown) {
    return this.invitations.upsertEvents(id, dto as never);
  }

  @Get("rsvps")
  rsvps(@Param("id") id: string, @Query("export") exportFormat?: "csv") {
    return this.invitations.listRsvps(id, exportFormat);
  }

  @Get("rsvps/stats")
  rsvpStats(@Param("id") id: string) {
    return this.invitations.rsvpStats(id);
  }
}

/**
 * PATCH /wishes/:id — separate resource, not nested under a project id, so
 * ProjectOwnerGuard (which expects a project id) doesn't apply here.
 * InvitationsService.moderateWish must itself verify the wish's
 * invitation → project.userId matches the caller (or caller is ADMIN).
 */
@Controller("wishes")
export class WishesController {
  constructor(private readonly invitations: InvitationsService) {}

  @Patch(":id")
  moderate(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() body: { status: "PENDING" | "APPROVED" | "REJECTED" },
  ) {
    return this.invitations.moderateWish(user, id, body.status);
  }
}
