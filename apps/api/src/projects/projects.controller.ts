import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { createProjectSchema, listProjectsQuerySchema, patchProjectSchema } from "@nivora/shared";
import { CurrentUser, type AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { ProjectOwnerGuard } from "../common/guards/project-owner.guard.js";
import { ProjectsService } from "./projects.service.js";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query(new ZodValidationPipe(listProjectsQuerySchema)) query: unknown) {
    return this.projects.list(user.id, query as never);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(createProjectSchema)) dto: unknown) {
    return this.projects.create(user.id, dto as never);
  }

  @UseGuards(ProjectOwnerGuard)
  @Get(":id")
  get(@Param("id") id: string) {
    return this.projects.get(id);
  }

  @UseGuards(ProjectOwnerGuard)
  @Patch(":id")
  patch(@Param("id") id: string, @Body(new ZodValidationPipe(patchProjectSchema)) dto: unknown) {
    return this.projects.patch(id, dto as never);
  }

  @UseGuards(ProjectOwnerGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.projects.softDelete(id);
  }

  @UseGuards(ProjectOwnerGuard)
  @Post(":id/duplicate")
  duplicate(@Param("id") id: string) {
    return this.projects.duplicate(id);
  }

  @UseGuards(ProjectOwnerGuard)
  @Get(":id/preview")
  preview(@Param("id") id: string) {
    return this.projects.preview(id);
  }

  @UseGuards(ProjectOwnerGuard)
  @Post(":id/submit")
  submit(@Param("id") id: string) {
    return this.projects.submit(id);
  }

  @UseGuards(ProjectOwnerGuard)
  @Post(":id/publish")
  publish(@Param("id") id: string) {
    return this.projects.publish(id);
  }

  @UseGuards(ProjectOwnerGuard)
  @Post(":id/unpublish")
  unpublish(@Param("id") id: string) {
    return this.projects.unpublish(id);
  }
}
