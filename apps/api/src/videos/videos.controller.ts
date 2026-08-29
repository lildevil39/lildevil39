import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { ProjectOwnerGuard } from "../common/guards/project-owner.guard.js";
import { VideosService } from "./videos.service.js";

@UseGuards(ProjectOwnerGuard)
@Controller("projects/:id")
export class VideosController {
  constructor(private readonly videos: VideosService) {}

  @Put("video")
  upsert(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
    return this.videos.upsert(id, dto);
  }

  @Put("video/scenes")
  upsertScenes(@Param("id") id: string, @Body() dto: unknown[]) {
    return this.videos.upsertScenes(id, dto);
  }
}
