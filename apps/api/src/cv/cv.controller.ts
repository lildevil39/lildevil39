import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { ProjectOwnerGuard } from "../common/guards/project-owner.guard.js";
import { CvService } from "./cv.service.js";

@UseGuards(ProjectOwnerGuard)
@Controller("projects/:id")
export class CvController {
  constructor(private readonly cv: CvService) {}

  @Put("cv")
  upsert(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
    return this.cv.upsert(id, dto);
  }
}
