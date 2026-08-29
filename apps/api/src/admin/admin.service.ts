import { Injectable, NotImplementedException } from "@nestjs/common";
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
    return this.prisma.user.findMany({ include: { profile: true }, orderBy: { createdAt: "desc" } });
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

  listTemplates() {
    return this.prisma.serviceTemplate.findMany();
  }

  createTemplate(_actor: AuthenticatedUser, _body: Record<string, unknown>) {
    throw new NotImplementedException("admin.createTemplate: TODO — create ServiceTemplate + audit()");
  }

  updateTemplate(_actor: AuthenticatedUser, _id: string, _body: Record<string, unknown>) {
    throw new NotImplementedException("admin.updateTemplate: TODO — update ServiceTemplate + audit()");
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

  updatePlans(_actor: AuthenticatedUser, _key: string, _body: Record<string, unknown>) {
    throw new NotImplementedException(
      "admin.updatePlans: TODO — edit ServicePlan prices without a deploy + audit()",
    );
  }

  listAuditLog() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  }
}
