import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator.js";
import { RolesGuard } from "../common/guards/roles.guard.js";
import { CurrentUser, type AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { AdminService } from "./admin.service.js";

/** Every handler here writes an audit row (see AdminService.audit). */
@UseGuards(RolesGuard)
@Roles("ADMIN")
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.stats();
  }

  @Get("users")
  users() {
    return this.admin.listUsers();
  }

  @Patch("users/:id")
  updateUser(@CurrentUser() actor: AuthenticatedUser, @Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.admin.updateUser(actor, id, body);
  }

  @Get("projects")
  projects() {
    return this.admin.listProjects();
  }

  @Get("orders")
  orders() {
    return this.admin.listOrders();
  }

  @Patch("orders/:id")
  updateOrder(@CurrentUser() actor: AuthenticatedUser, @Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.admin.updateOrder(actor, id, body);
  }

  @Post("payments/:id/refund")
  refund(@CurrentUser() actor: AuthenticatedUser, @Param("id") id: string) {
    return this.admin.refundPayment(actor, id);
  }

  @Get("templates")
  listTemplates() {
    return this.admin.listTemplates();
  }

  @Post("templates")
  createTemplate(@CurrentUser() actor: AuthenticatedUser, @Body() body: Record<string, unknown>) {
    return this.admin.createTemplate(actor, body);
  }

  @Put("templates/:id")
  updateTemplate(@CurrentUser() actor: AuthenticatedUser, @Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.admin.updateTemplate(actor, id, body);
  }

  @Get("music")
  listMusic() {
    return this.admin.listMusic();
  }

  @Post("music")
  createMusic(@CurrentUser() actor: AuthenticatedUser, @Body() body: Record<string, unknown>) {
    return this.admin.createMusic(actor, body);
  }

  @Get("coupons")
  listCoupons() {
    return this.admin.listCoupons();
  }

  @Post("coupons")
  createCoupon(@CurrentUser() actor: AuthenticatedUser, @Body() body: Record<string, unknown>) {
    return this.admin.createCoupon(actor, body);
  }

  @Put("coupons/:id")
  updateCoupon(@CurrentUser() actor: AuthenticatedUser, @Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.admin.updateCoupon(actor, id, body);
  }

  @Put("services/:key/plans")
  updatePlans(@CurrentUser() actor: AuthenticatedUser, @Param("key") key: string, @Body() body: Record<string, unknown>) {
    return this.admin.updatePlans(actor, key, body);
  }

  @Get("audit-log")
  auditLog() {
    return this.admin.listAuditLog();
  }
}
