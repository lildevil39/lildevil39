import { Injectable, NotImplementedException } from "@nestjs/common";
import type { ModerationState, RsvpDto, WeddingInvitationDto, WishDto } from "@nivora/shared";
import type { AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(_projectId: string, _dto: WeddingInvitationDto) {
    throw new NotImplementedException("invitations.upsert: TODO — upsert WeddingInvitation by projectId");
  }

  upsertEvents(_projectId: string, _events: unknown[]) {
    throw new NotImplementedException(
      "invitations.upsertEvents: TODO — replace WeddingEvent[] for this invitation (Cérémonie/Cocktail/Dîner/Soirée)",
    );
  }

  listRsvps(_projectId: string, _exportFormat?: "csv") {
    throw new NotImplementedException("invitations.listRsvps: TODO — list + optional CSV export");
  }

  rsvpStats(_projectId: string) {
    throw new NotImplementedException(
      "invitations.rsvpStats: TODO — { confirmed, declined, maybe, pending, guestsTotal }",
    );
  }

  moderateWish(_actor: AuthenticatedUser, _wishId: string, _status: ModerationState) {
    throw new NotImplementedException(
      "invitations.moderateWish: TODO — verify wish.invitation.project.userId === actor.id (or ADMIN), then update status",
    );
  }

  getPublished(_slug: string) {
    throw new NotImplementedException(
      "invitations.getPublished: TODO — 404 if unpublished; increment viewCount; return render payload",
    );
  }

  submitRsvp(_slug: string, _dto: RsvpDto) {
    throw new NotImplementedException(
      "invitations.submitRsvp: TODO — reject silently if honeypot filled; store ip; notify owner (NEW_RSVP)",
    );
  }

  submitWish(_slug: string, _dto: WishDto) {
    throw new NotImplementedException(
      "invitations.submitWish: TODO — status=PENDING until owner approves; notify owner (NEW_WISH)",
    );
  }

  listApprovedWishes(_slug: string) {
    throw new NotImplementedException("invitations.listApprovedWishes: TODO — status=APPROVED only");
  }
}
