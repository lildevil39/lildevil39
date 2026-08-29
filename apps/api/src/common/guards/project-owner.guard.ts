import {
  Injectable,
  NotFoundException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

/**
 * Loads `projects.:id` and 404s (never 403) when `project.userId !== user.id`,
 * unless the caller is ADMIN. Attaches the loaded project to `request.project`
 * so downstream handlers don't re-fetch it.
 */
@Injectable()
export class ProjectOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, params } = request;
    const projectId = params.id ?? params.projectId;

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });

    if (!project || (project.userId !== user?.id && user?.role !== "ADMIN")) {
      throw new NotFoundException({ code: "PROJECT_NOT_FOUND", message: "Project not found" });
    }

    request.project = project;
    return true;
  }
}
