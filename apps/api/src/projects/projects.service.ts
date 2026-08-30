import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from "@nestjs/common";
import type { CreateProjectDto, ListProjectsQueryDto, PatchProjectDto } from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

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
        invitation: { include: { events: true }, },
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

  submit(_id: string) {
    throw new NotImplementedException(
      "projects.submit: TODO — validate required fields, create Order (price snapshot from ServicePlan)",
    );
  }

  publish(_id: string) {
    throw new NotImplementedException(
      "projects.publish: TODO — order must be PAID; allocate slug, snapshot render payload, set publishedAt",
    );
  }

  unpublish(_id: string) {
    throw new NotImplementedException("projects.unpublish: TODO — clear publishedAt");
  }
}
