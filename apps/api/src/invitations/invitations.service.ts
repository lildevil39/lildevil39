import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { ModerationState, RsvpDto, WeddingInvitationDto, WishDto } from "@nivora/shared";
import type { AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(projectId: string, dto: WeddingInvitationDto) {
    const data = {
      ...dto,
      weddingDate: new Date(dto.weddingDate),
      rsvpDeadline: dto.rsvpDeadline ? new Date(dto.rsvpDeadline) : undefined,
    };
    return this.prisma.weddingInvitation.upsert({
      where: { projectId },
      update: data,
      create: { projectId, ...data },
    });
  }

  async upsertEvents(
    projectId: string,
    events: Array<{ title: string; startsAt?: string; timeLabel?: string; note?: string; sortOrder?: number }>,
  ) {
    const invitation = await this.prisma.weddingInvitation.findUnique({ where: { projectId } });
    if (!invitation) {
      throw new BadRequestException({
        code: "NO_INVITATION",
        message: "Create the invitation before adding its programme",
      });
    }

    await this.prisma.$transaction([
      this.prisma.weddingEvent.deleteMany({ where: { invitationId: invitation.id } }),
      this.prisma.weddingEvent.createMany({
        data: events.map((e, i) => ({
          invitationId: invitation.id,
          title: e.title,
          startsAt: e.startsAt ? new Date(e.startsAt) : undefined,
          timeLabel: e.timeLabel,
          note: e.note,
          sortOrder: e.sortOrder ?? i,
        })),
      }),
    ]);
    return this.prisma.weddingEvent.findMany({
      where: { invitationId: invitation.id },
      orderBy: { sortOrder: "asc" },
    });
  }

  async listRsvps(projectId: string, exportFormat?: "csv") {
    const invitation = await this.prisma.weddingInvitation.findUnique({ where: { projectId } });
    const rsvps = invitation
      ? await this.prisma.weddingRsvp.findMany({
          where: { invitationId: invitation.id },
          orderBy: { createdAt: "desc" },
        })
      : [];

    if (exportFormat === "csv") {
      const header = "name,email,phone,guests,attendance,message,createdAt";
      const rows = rsvps.map((r) =>
        [r.name, r.email ?? "", r.phone ?? "", r.guests, r.attendance, (r.message ?? "").replace(/,/g, ";"), r.createdAt.toISOString()].join(","),
      );
      return { csv: [header, ...rows].join("\n") };
    }
    return rsvps;
  }

  async rsvpStats(projectId: string) {
    const invitation = await this.prisma.weddingInvitation.findUnique({ where: { projectId } });
    if (!invitation) return { confirmed: 0, declined: 0, maybe: 0, pending: 0, guestsTotal: 0 };

    const rsvps = await this.prisma.weddingRsvp.findMany({ where: { invitationId: invitation.id } });
    const confirmed = rsvps.filter((r) => r.attendance === "YES");
    return {
      confirmed: confirmed.length,
      declined: rsvps.filter((r) => r.attendance === "NO").length,
      maybe: rsvps.filter((r) => r.attendance === "MAYBE").length,
      pending: 0, // an RSVP row only exists once a guest has actually replied — nothing to count as "pending" yet
      guestsTotal: confirmed.reduce((sum, r) => sum + r.guests, 0),
    };
  }

  async moderateWish(actor: AuthenticatedUser, wishId: string, status: ModerationState) {
    const wish = await this.prisma.weddingMessage.findUnique({
      where: { id: wishId },
      include: { invitation: { include: { project: true } } },
    });
    // 404, not 403, for someone else's wish — same convention as ProjectOwnerGuard: never confirm it exists.
    if (!wish || (wish.invitation.project.userId !== actor.id && actor.role !== "ADMIN")) {
      throw new NotFoundException({ code: "WISH_NOT_FOUND", message: "Wish not found" });
    }
    return this.prisma.weddingMessage.update({ where: { id: wishId }, data: { status } });
  }

  private async findPublishedInvitation(slug: string) {
    const project = await this.prisma.project.findFirst({
      where: { slug, publishedAt: { not: null }, deletedAt: null },
      include: { invitation: { include: { events: true, music: true } }, template: true },
    });
    if (!project?.invitation) {
      throw new NotFoundException({ code: "NOT_FOUND", message: "Invitation not found" });
    }
    return project;
  }

  async getPublished(slug: string) {
    const project = await this.findPublishedInvitation(slug);
    await this.prisma.weddingInvitation.update({
      where: { id: project.invitation!.id },
      data: { viewCount: { increment: 1 } },
    });
    return {
      slug: project.slug,
      template: project.template
        ? { code: project.template.code, name: project.template.name, config: project.template.config }
        : null,
      invitation: project.invitation,
    };
  }

  async submitRsvp(slug: string, dto: RsvpDto, ip?: string) {
    const project = await this.findPublishedInvitation(slug);
    const invitation = project.invitation!;
    if (!invitation.rsvpEnabled) {
      throw new ForbiddenException({ code: "RSVP_DISABLED", message: "RSVP is disabled for this invitation" });
    }

    const rsvp = await this.prisma.weddingRsvp.create({
      data: {
        invitationId: invitation.id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        guests: dto.guests,
        attendance: dto.attendance,
        message: dto.message,
        ip,
      },
    });
    await this.prisma.notification.create({
      data: {
        userId: project.userId,
        type: "NEW_RSVP",
        title: "Nouvelle réponse RSVP",
        body: `${dto.name} — ${dto.attendance}`,
      },
    });
    return rsvp;
  }

  async submitWish(slug: string, dto: WishDto) {
    const project = await this.findPublishedInvitation(slug);
    const invitation = project.invitation!;
    if (!invitation.wishesEnabled) {
      throw new ForbiddenException({ code: "WISHES_DISABLED", message: "Wishes are disabled for this invitation" });
    }

    const wish = await this.prisma.weddingMessage.create({
      data: { invitationId: invitation.id, name: dto.name, message: dto.message, status: "PENDING" },
    });
    await this.prisma.notification.create({
      data: { userId: project.userId, type: "NEW_WISH", title: "Nouveau vœu", body: `${dto.name}` },
    });
    return wish;
  }

  async listApprovedWishes(slug: string) {
    const project = await this.findPublishedInvitation(slug);
    return this.prisma.weddingMessage.findMany({
      where: { invitationId: project.invitation!.id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
  }
}
