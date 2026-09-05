import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import type { CreateProjectDto, ListProjectsQueryDto, PatchProjectDto } from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import { OrdersService } from "../orders/orders.service.js";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orders: OrdersService,
  ) {}

  list(userId: string, query: ListProjectsQueryDto) {
    return this.prisma.project.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(query.status ? { status: query.status as never } : {}),
        ...(query.service ? { service: { key: query.service } } : {}),
      },
      include: { service: true, template: true },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { createdAt: "desc" },
    });
  }

  async create(userId: string, dto: CreateProjectDto) {
    const service = await this.prisma.service.findUnique({ where: { key: dto.serviceKey } });
    if (!service) {
      throw new BadRequestException({ code: "UNKNOWN_SERVICE", message: "Unknown service key" });
    }

    return this.prisma.project.create({
      data: {
        userId,
        serviceId: service.id,
        title: service.nameFr,
        planTier: dto.planTier,
        status: "DRAFT",
      },
      include: { service: true, template: true },
    });
  }

  get(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        service: true,
        template: true,
        invitation: { include: { events: true } },
      },
    });
  }

  async patch(id: string, dto: PatchProjectDto) {
    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id },
      include: { service: true },
    });

    const { templateId, ...rest } = dto.data as Record<string, unknown> & { templateId?: string };

    if (templateId !== undefined) {
      await this.assertTemplateBelongsToService(templateId, project.serviceId);
    }

    switch (project.service.key) {
      case "wedding-invitation":
        await this.patchWeddingInvitation(id, rest);
        break;
      default:
        if (Object.keys(rest).length > 0) {
          throw new NotImplementedException(
            `projects.patch: form data for service "${project.service.key}" isn't wired up yet — only wedding-invitation is`,
          );
        }
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.step !== undefined ? { currentStep: dto.step } : {}),
        ...(templateId !== undefined ? { templateId } : {}),
      },
      include: { service: true, template: true, invitation: { include: { events: true } } },
    });
  }

  private async assertTemplateBelongsToService(templateId: string, serviceId: string) {
    if (templateId === "") return; // clearing the selection
    const template = await this.prisma.serviceTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.serviceId !== serviceId) {
      throw new BadRequestException({
        code: "INVALID_TEMPLATE",
        message: "Template does not belong to this project's service",
      });
    }
  }

  /**
   * Only the fields a customer can actually set through the form are
   * accepted here — never trust the body wholesale into a Prisma update.
   */
  private async patchWeddingInvitation(projectId: string, data: Record<string, unknown>) {
    const ALLOWED = [
      "brideName",
      "groomName",
      "weddingDate",
      "weddingTime",
      "venueName",
      "address",
      "mapsUrl",
      "contactPhone",
      "contactEmail",
      "dressCode",
      "notes",
      "locale",
      "messageFr",
      "messageEn",
      "messageAr",
      "musicId",
      "rsvpEnabled",
      "rsvpDeadline",
      "wishesEnabled",
      "countdownEnabled",
    ] as const;

    const fields: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (data[key] !== undefined) fields[key] = data[key];
    }
    if (fields.weddingDate) fields.weddingDate = new Date(fields.weddingDate as string);
    if (fields.rsvpDeadline) fields.rsvpDeadline = new Date(fields.rsvpDeadline as string);
    if (Object.keys(fields).length === 0) return;

    await this.prisma.weddingInvitation.upsert({
      where: { projectId },
      update: fields,
      create: { projectId, ...fields },
    });
  }

  async softDelete(id: string) {
    const project = await this.prisma.project.findUniqueOrThrow({ where: { id } });
    if (project.status !== "DRAFT") {
      throw new ForbiddenException({
        code: "NOT_A_DRAFT",
        message: "Only draft projects can be deleted",
      });
    }
    await this.prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  duplicate(_id: string) {
    throw new NotImplementedException("projects.duplicate: TODO — deep clone project + child record + files refs");
  }

  async preview(id: string) {
    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id },
      include: {
        service: true,
        template: true,
        invitation: { include: { events: true } },
      },
    });

    if (project.service.key === "wedding-invitation") {
      return {
        serviceKey: project.service.key,
        template: project.template
          ? { code: project.template.code, name: project.template.name, config: project.template.config }
          : null,
        invitation: project.invitation ?? null,
      };
    }

    throw new NotImplementedException(
      `projects.preview: render payload for service "${project.service.key}" isn't wired up yet`,
    );
  }

  async submit(id: string) {
    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id },
      include: { service: true, invitation: true },
    });

    if (project.service.key === "wedding-invitation") {
      const inv = project.invitation;
      if (!inv?.brideName || !inv?.groomName || !inv?.weddingDate) {
        throw new BadRequestException({
          code: "INCOMPLETE_PROJECT",
          message: "Bride name, groom name and wedding date are required before ordering",
        });
      }
    } else {
      throw new NotImplementedException(
        `projects.submit: validation for service "${project.service.key}" isn't wired up yet`,
      );
    }

    const order = await this.orders.createForProject(project.userId, project.id, project.planTier);
    await this.prisma.project.update({ where: { id }, data: { status: "SUBMITTED" } });
    return { orderId: order.id };
  }

  async publish(id: string) {
    const project = await this.prisma.project.findUniqueOrThrow({
      where: { id },
      include: { service: true, orders: true, invitation: true },
    });

    if (project.service.key !== "wedding-invitation") {
      throw new NotImplementedException(
        `projects.publish: publishing for service "${project.service.key}" isn't wired up yet`,
      );
    }

    const paidOrder = project.orders.find((o) => o.status === "PAID" || o.status === "COMPLETED");
    if (!paidOrder) {
      throw new ForbiddenException({
        code: "ORDER_NOT_PAID",
        message: "This project has no paid order yet",
      });
    }

    const slug = project.slug ?? (await this.allocateSlug(project.invitation));
    const updated = await this.prisma.project.update({
      where: { id },
      data: { slug, publishedAt: new Date(), status: "READY" },
    });

    const webUrl = process.env.WEB_URL ?? "http://localhost:5173";
    return { slug: updated.slug, url: `${webUrl}/invite/${updated.slug}` };
  }

  private slugify(input: string): string {
    const COMBINING_DIACRITICS = new RegExp(String.fromCharCode(0x5b, 0x5c, 0x75, 0x30, 0x33, 0x30, 0x30, 0x2d, 0x5c, 0x75, 0x30, 0x33, 0x36, 0x66, 0x5d), "g");
    return input
      .normalize("NFD")
      .replace(COMBINING_DIACRITICS, "") // strip combining diacritics (accented letters -> plain ascii)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private async allocateSlug(invitation: { brideName: string | null; groomName: string | null } | null) {
    const base =
      [invitation?.brideName, invitation?.groomName]
        .filter(Boolean)
        .map((n) => this.slugify(n as string))
        .join("-") || "invitation";

    for (let attempt = 0; attempt < 8; attempt++) {
      const suffix = attempt === 0 ? "" : `-${Math.floor(1000 + Math.random() * 9000)}`;
      const candidate = `${base}${suffix}`;
      const exists = await this.prisma.project.findUnique({ where: { slug: candidate } });
      if (!exists) return candidate;
    }
    return `${base}-${Date.now()}`;
  }

  async unpublish(id: string) {
    await this.prisma.project.update({ where: { id }, data: { publishedAt: null } });
  }
}
