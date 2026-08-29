import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { ProjectOwnerGuard } from "../common/guards/project-owner.guard.js";
import { LogosService } from "./logos.service.js";

@UseGuards(ProjectOwnerGuard)
@Controller("projects/:id")
export class LogosController {
  constructor(private readonly logos: LogosService) {}

  @Put("logo")
  upsert(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
    return this.logos.upsert(id, dto);
  }
}
