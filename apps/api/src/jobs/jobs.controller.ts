import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ProjectOwnerGuard } from "../common/guards/project-owner.guard.js";
import { JobsService } from "./jobs.service.js";

@Controller()
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @UseGuards(ProjectOwnerGuard)
  @Post("projects/:id/generate")
  generate(@Param("id") id: string, @Body() body: { type: string }) {
    return this.jobs.generate(id, body.type as never);
  }

  @Get("jobs/:id")
  get(@Param("id") id: string) {
    return this.jobs.get(id);
  }

  @UseGuards(ProjectOwnerGuard)
  @Get("projects/:id/jobs")
  listForProject(@Param("id") id: string) {
    return this.jobs.listForProject(id);
  }
}
