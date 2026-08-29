import { Module } from "@nestjs/common";
import { LogosController } from "./logos.controller.js";
import { LogosService } from "./logos.service.js";

@Module({
  controllers: [LogosController],
  providers: [LogosService],
  exports: [LogosService],
})
export class LogosModule {}
