import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/** Thin per-request timing log; nestjs-pino handles structured request logs globally. */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const started = Date.now();
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap(() =>
        // eslint-disable-next-line no-console
        console.debug(`${request.method} ${request.url} ${Date.now() - started}ms`),
      ),
    );
  }
}
