import { BadRequestException, Injectable, NotFoundException, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AuthenticatedUser } from "../common/decorators/current-user.decorator.js";

/** Every mutating method here must call `audit()` before returning. */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private audit(actorId: string, action: string, entity: string, entityId?: string, meta?: unknown) {
    return this.prisma.auditLog.create({ data: { actorId, action, entity, entityId, meta: meta as never } });
  }

  async stats() {
    const [totalUsers, totalOrders, pendingOrders, completedOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
      this.prisma.order.count({ where: { status: "COMPLETED" } }),
    ]);
    return { totalUsers, totalOrders, pendingOrders, completedOrders };
  }

  listUsers() {
    return this.prisma.user.findMany({
      // Never select passwordHash — this response goes straight to the client.
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  updateUser(_actor: AuthenticatedUser, _id: string, _body: Record<string, unknown>) {
    throw new NotImplementedException("admin.updateUser: TODO — role/status change + audit()");
  }

  listProjects() {
    return this.prisma.project.findMany({ include: { service: true, user: true }, orderBy: { createdAt: "desc" } });
  }

  listOrders() {
    return this.prisma.order.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } });
  }

  updateOrder(_actor: AuthenticatedUser, _id: string, _body: Record<string, unknown>) {
    throw new NotImplementedException("admin.updateOrder: TODO — status change + audit()");
  }

  refundPayment(_actor: AuthenticatedUser, _id: string) {
    throw new NotImplementedException("admin.refundPayment: TODO — call PaymentProvider.refund + audit()");
  }

  listServices() {
    // Includes inactive services — unlike the public catalogue, admin needs to see everything to manage it.
    return this.prisma.service.findMany({
      include: { plans: true, templates: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  async updateService(actor: AuthenticatedUser, key: string, body: Record<string, unknown>) {
    const service = await this.prisma.service.findUnique({ where: { key } });
    if (!service) throw new NotFoundException({ code: "SERVICE_NOT_FOUND", message: "Unknown service key" });

    const ALLOWED = ["nameFr", "nameEn", "taglineFr", "taglineEn", "icon", "sortOrder", "isActive"] as const;
    const data: Record<string, unknown> = {};
    for (const field of ALLOWED) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const updated = await this.prisma.service.update({ where: { key }, data });
    await this.audit(actor.id, "service.update", "Service", updated.id, data);
    return updated;
  }

  listTemplates(serviceKey?: string) {
    return this.prisma.serviceTemplate.findMany({
      where: serviceKey ? { service: { key: serviceKey } } : undefined,
      include: { service: true },
      orderBy: [{ serviceId: "asc" }, { sortOrder: "asc" }],
    });
  }

  async createTemplate(actor: AuthenticatedUser, body: Record<string, unknown>) {
    const { serviceKey, code, name, description, config, requiredTier, sortOrder } = body as {
      serviceKey?: string;
      code?: string;
      name?: string;
      description?: string;
      config?: unknown;
      requiredTier?: "STARTER" | "PREMIUM";
      sortOrder?: number;
    };
    if (!serviceKey || !code || !name) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "serviceKey, code and name are required",
      });
    }

    const service = await this.prisma.service.findUnique({ where: { key: serviceKey } });
    if (!service) throw new NotFoundException({ code: "SERVICE_NOT_FOUND", message: "Unknown service key" });

    const template = await this.prisma.serviceTemplate.create({
      data: {
        serviceId: service.id,
        code,
        name,
        description,
        config: (config ?? {}) as never,
        requiredTier: requiredTier ?? "STARTER",
        sortOrder: sortOrder ?? 0,
      },
    });
    await this.audit(actor.id, "template.create", "ServiceTemplate", template.id, body);
    return template;
  }

  async updateTemplate(actor: AuthenticatedUser, id: string, body: Record<string, unknown>) {
    const existing = await this.prisma.serviceTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ code: "TEMPLATE_NOT_FOUND", message: "Template not found" });
    }

    const ALLOWED = ["name", "description", "config", "requiredTier", "isActive", "sortOrder"] as const;
    const data: Record<string, unknown> = {};
    for (const field of ALLOWED) {
      if (body[field] !== undefined) data[field] = body[field];
    }

    const updated = await this.prisma.serviceTemplate.update({ where: { id }, data });
    await this.audit(actor.id, "template.update", "ServiceTemplate", id, data);
    return updated;
  }

  listMusic() {
    return this.prisma.music.findMany();
  }

  createMusic(_actor: AuthenticatedUser, _body: Record<string, unknown>) {
    throw new NotImplementedException("admin.createMusic: TODO — create Music row (licence-clear only) + audit()");
  }

  listCoupons() {
    return this.prisma.coupon.findMany();
  }

  createCoupon(_actor: AuthenticatedUser, _body: Record<string, unknown>) {
    throw new NotImplementedException("admin.createCoupon: TODO — create Coupon + audit()");
  }

  updateCoupon(_actor: AuthenticatedUser, _id: string, _body: Record<string, unknown>) {
    throw new NotImplementedException("admin.updateCoupon: TODO — update Coupon + audit()");
  }

  /** body: { plans: [{ tier: 'STARTER'|'PREMIUM', priceTnd?, priceEur?, featuresFr?, featuresEn?, isActive? }] } */
  async updatePlans(actor: AuthenticatedUser, key: string, body: Record<string, unknown>) {
    const service = await this.prisma.service.findUnique({ where: { key } });
    if (!service) throw new NotFoundException({ code: "SERVICE_NOT_FOUND", message: "Unknown service key" });

    const plans = body.plans as
      | Array<{
          tier: "STARTER" | "PREMIUM";
          priceTnd?: number;
          priceEur?: number;
          featuresFr?: unknown;
          featuresEn?: unknown;
          isActive?: boolean;
        }>
      | undefined;
    if (!Array.isArray(plans) || plans.length === 0) {
      throw new BadRequestException({ code: "VALIDATION_ERROR", message: "body.plans[] is required" });
    }

    const updated = await this.prisma.$transaction(
      plans.map((plan) => {
        const { tier, ...rest } = plan;
        return this.prisma.servicePlan.upsert({
          where: { serviceId_tier: { serviceId: service.id, tier } },
          update: rest as never,
          create: { serviceId: service.id, tier, priceTnd: 0, priceEur: 0, featuresFr: [], featuresEn: [], ...rest } as never,
        });
      }),
    );

    await this.audit(actor.id, "plans.update", "Service", service.id, body);
    return updated;
  }

  listAuditLog() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  }
}
