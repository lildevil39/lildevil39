import { Module } from "@nestjs/common";
import { BusinessCardsController } from "./business-cards.controller.js";
import { BusinessCardsService } from "./business-cards.service.js";

@Module({
  controllers: [BusinessCardsController],
  providers: [BusinessCardsService],
  exports: [BusinessCardsService],
})
export class BusinessCardsModule {}
