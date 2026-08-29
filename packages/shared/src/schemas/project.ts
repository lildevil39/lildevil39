import { z } from "zod";
import { PLAN_TIERS, SERVICE_KEYS } from "../enums";

export const createProjectSchema = z.object({
  serviceKey: z.enum(SERVICE_KEYS),
  planTier: z.enum(PLAN_TIERS).default("STARTER"),
});
export type CreateProjectDto = z.infer<typeof createProjectSchema>;

export const patchProjectSchema = z.object({
  step: z.number().int().min(1).optional(),
  data: z.record(z.string(), z.unknown()),
});
export type PatchProjectDto = z.infer<typeof patchProjectSchema>;

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  service: z.enum(SERVICE_KEYS).optional(),
  status: z.string().optional(),
});
export type ListProjectsQueryDto = z.infer<typeof listProjectsQuerySchema>;
