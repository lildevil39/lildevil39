import { z } from "zod";
import { PLAN_TIERS } from "../enums.js";

export const createOrderSchema = z.object({
  projectId: z.string().cuid(),
  planTier: z.enum(PLAN_TIERS),
  couponCode: z.string().optional(),
});
export type CreateOrderDto = z.infer<typeof createOrderSchema>;

export const checkoutSchema = z.object({
  orderId: z.string().cuid(),
  provider: z.enum(["stripe", "paypal", "konnect", "mock"]).optional(),
});
export type CheckoutDto = z.infer<typeof checkoutSchema>;

export const couponValidateSchema = z.object({
  code: z.string().min(1),
  serviceKey: z.string().min(1),
  amount: z.number().int().min(0),
});
export type CouponValidateDto = z.infer<typeof couponValidateSchema>;
