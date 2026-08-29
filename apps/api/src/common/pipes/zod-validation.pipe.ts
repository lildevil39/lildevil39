import { BadRequestException, Injectable, type PipeTransform } from "@nestjs/common";
import type { ZodSchema } from "zod";

/**
 * Validates the request body/query/params against a Zod schema from
 * `@nivora/shared`. Usage: `@Body(new ZodValidationPipe(registerSchema))`.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid request body",
        details: result.error.flatten(),
      });
    }
    return result.data;
  }
}
