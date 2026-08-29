import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";

/**
 * Global guard. Verifies the `Authorization: Bearer <accessToken>` header
 * and attaches `{ id, email, role }` to `request.user`.
 * Opt out per-route with `@Public()`.
 *
 * Throws UnauthorizedException (401) explicitly — a guard that just returns
 * `false` makes Nest throw ForbiddenException (403) by default, which is
 * the wrong status for "missing/invalid token" (403 is for RolesGuard).
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Missing access token" });
    }

    try {
      request.user = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return true;
    } catch {
      throw new UnauthorizedException({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
    }
  }
}
