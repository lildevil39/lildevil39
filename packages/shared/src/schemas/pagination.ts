import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
});
export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;

export interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; perPage: number; total: number };
}

/** Shape of every error response from the global HttpExceptionFilter. */
export interface ApiErrorShape {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}
