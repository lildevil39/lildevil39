import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import type { Response } from "express";
import type { ApiErrorShape } from "@nivora/shared";

/**
 * Normalizes every thrown error into `{ statusCode, code, message, details? }`.
 * Never leaks Prisma error internals — unknown errors become a generic 500.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload: ApiErrorShape =
        typeof body === "object" && body !== null && "code" in body
          ? (body as ApiErrorShape)
          : {
              statusCode: status,
              code: HttpStatus[status] ?? "ERROR",
              message: exception.message,
            };
      response.status(status).json(payload);
      return;
    }

    // eslint-disable-next-line no-console
    console.error(exception);
    response.status(500).json({
      statusCode: 500,
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    } satisfies ApiErrorShape);
  }
}
