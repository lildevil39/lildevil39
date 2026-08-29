import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { ProjectOwnerGuard } from "../common/guards/project-owner.guard.js";
import { BusinessCardsService } from "./business-cards.service.js";

@UseGuards(ProjectOwnerGuard)
@Controller("projects/:id")
export class BusinessCardsController {
  constructor(private readonly cards: BusinessCardsService) {}

  @Put("business-card")
  upsert(@Param("id") id: string, @Body() dto: Record<string, unknown>) {
    return this.cards.upsert(id, dto);
  }
}
