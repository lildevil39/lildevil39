import { Injectable, NotImplementedException } from "@nestjs/common";
import type { CouponValidateDto } from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class CatalogueService {
  constructor(private readonly prisma: PrismaService) {}

  listServices() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      include: { plans: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  getService(key: string) {
    return this.prisma.service.findUnique({
      where: { key },
      include: { plans: true, templates: true },
    });
  }

  listTemplates(key: string) {
    return this.prisma.serviceTemplate.findMany({
      where: { service: { key }, isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  listMusic(tag?: string) {
    return this.prisma.music.findMany({
      where: { isActive: true, ...(tag ? { tags: { has: tag } } : {}) },
    });
  }

  validateCoupon(_dto: CouponValidateDto) {
    throw new NotImplementedException(
      "catalogue.validateCoupon: TODO — check active window, service scope, redemption cap",
    );
  }
}
