import { Injectable, NotImplementedException } from "@nestjs/common";
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
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      orderBy: { createdAt: "desc" },
    });
  }

  create(_userId: string, _dto: CreateProjectDto) {
    throw new NotImplementedException(
      "projects.create: TODO — create Project(status=DRAFT) + typed child record (invitation/video/cv/...) so autosave has a target",
    );
  }

  get(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: { service: true, template: true },
    });
  }

  patch(_id: string, _dto: PatchProjectDto) {
    throw new NotImplementedException(
      "projects.patch: TODO — merge dto.data into the typed child record for this service, bump currentStep",
    );
  }

  softDelete(_id: string) {
    throw new NotImplementedException("projects.softDelete: TODO — drafts only, set deletedAt");
  }

  duplicate(_id: string) {
    throw new NotImplementedException("projects.duplicate: TODO — deep clone project + child record + files refs");
  }

  preview(_id: string) {
    throw new NotImplementedException(
      "projects.preview: TODO — normalized render payload the live preview consumes",
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
