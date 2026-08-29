import { Injectable, NotImplementedException } from "@nestjs/common";
import type { CreateOrderDto } from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";

/** Body prices are always ignored — the price snapshot comes from ServicePlan server-side. */
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(_userId: string, _dto: CreateOrderDto) {
    throw new NotImplementedException(
      "orders.create: TODO — snapshot ServicePlan price, apply coupon, generate reference (NIV-2026-000123)",
    );
  }

  listForUser(userId: string) {
    return this.prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }

  getForUser(userId: string, id: string) {
    return this.prisma.order.findFirst({ where: { id, userId } });
  }

  cancel(_userId: string, _id: string) {
    throw new NotImplementedException("orders.cancel: TODO — only PENDING_PAYMENT orders may be cancelled");
  }
}
