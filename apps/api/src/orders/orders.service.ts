import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateOrderDto } from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";

/** Body prices are always ignored — the price snapshot comes from ServicePlan server-side. */
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateOrderDto) {
    return this.createForProject(userId, dto.projectId, dto.planTier);
  }

  /**
   * Shared by POST /orders and projects.submit(). couponCode is accepted
   * but not yet validated/applied — see docs-seed-data.md § Coupons for the
   * data model (percentOff/amountOff, service scope, expiry, redemption cap)
   * this still needs; for now a coupon is silently ignored rather than
   * pretending to discount something.
   */
  async createForProject(userId: string, projectId: string, planTier: "STARTER" | "PREMIUM") {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { service: true },
    });
    if (!project || project.userId !== userId) {
      throw new NotFoundException({ code: "PROJECT_NOT_FOUND", message: "Project not found" });
    }

    const plan = await this.prisma.servicePlan.findUnique({
      where: { serviceId_tier: { serviceId: project.serviceId, tier: planTier } },
    });
    if (!plan || !plan.isActive) {
      throw new BadRequestException({ code: "PLAN_NOT_FOUND", message: "This plan isn't available" });
    }

    const reference = await this.generateReference();
    return this.prisma.order.create({
      data: {
        reference,
        userId,
        projectId,
        serviceKey: project.service.key,
        planTier,
        currency: "TND",
        subtotal: plan.priceTnd,
        discount: 0,
        total: plan.priceTnd,
        status: "PENDING_PAYMENT",
      },
    });
  }

  private async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `NIV-${year}-${String(Math.floor(100000 + Math.random() * 900000))}`;
      const exists = await this.prisma.order.findUnique({ where: { reference: candidate } });
      if (!exists) return candidate;
    }
    // Astronomically unlikely, but fall back to something guaranteed unique.
    return `NIV-${year}-${Date.now()}`;
  }

  listForUser(userId: string) {
    return this.prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }

  getForUser(userId: string, id: string) {
    return this.prisma.order.findFirst({ where: { id, userId } });
  }

  async cancel(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({ where: { id, userId } });
    if (!order) throw new NotFoundException({ code: "ORDER_NOT_FOUND", message: "Order not found" });
    if (order.status !== "PENDING_PAYMENT") {
      throw new ForbiddenException({
        code: "NOT_CANCELLABLE",
        message: "Only orders pending payment can be cancelled",
      });
    }
    return this.prisma.order.update({ where: { id }, data: { status: "CANCELLED" } });
  }
}
