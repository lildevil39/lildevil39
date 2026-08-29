import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { createOrderSchema } from "@nivora/shared";
import { CurrentUser, type AuthenticatedUser } from "../common/decorators/current-user.decorator.js";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { OrdersService } from "./orders.service.js";

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(createOrderSchema)) dto: unknown) {
    return this.orders.create(user.id, dto as never);
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.orders.listForUser(user.id);
  }

  @Get(":id")
  get(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.orders.getForUser(user.id, id);
  }

  @Post(":id/cancel")
  cancel(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.orders.cancel(user.id, id);
  }
}
