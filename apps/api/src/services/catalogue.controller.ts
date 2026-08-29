import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { couponValidateSchema } from "@nivora/shared";
import { Public } from "../common/decorators/public.decorator.js";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { CatalogueService } from "./catalogue.service.js";

/** Public catalogue — services, plans, templates, music library, coupon check. */
@Controller()
export class CatalogueController {
  constructor(private readonly catalogue: CatalogueService) {}

  @Public()
  @Get("services")
  list() {
    return this.catalogue.listServices();
  }

  @Public()
  @Get("services/:key")
  get(@Param("key") key: string) {
    return this.catalogue.getService(key);
  }

  @Public()
  @Get("services/:key/templates")
  templates(@Param("key") key: string) {
    return this.catalogue.listTemplates(key);
  }

  @Public()
  @Get("music")
  music(@Query("tag") tag?: string) {
    return this.catalogue.listMusic(tag);
  }

  @Public()
  @Post("coupons/validate")
  validateCoupon(@Body(new ZodValidationPipe(couponValidateSchema)) dto: unknown) {
    return this.catalogue.validateCoupon(dto as never);
  }
}
