import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { ProjectOwnerGuard } from "../common/guards/project-owner.guard.js";
import { BrandingService } from "./branding.service.js";

@UseGuards(ProjectOwnerGuard)
@Controller("projects/:id")
export class BrandingController {
  constructor(private readonly branding: BrandingService) {}

  @Put("brand")
  upsert(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
    return this.branding.upsert(id, dto);
  }
}
