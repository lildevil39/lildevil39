import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { rsvpSchema, wishSchema } from "@nivora/shared";
import { Public } from "../common/decorators/public.decorator.js";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe.js";
import { InvitationsService } from "./invitations.service.js";

/** No auth. Server-rendered meta tags for the slug page itself live in the web app's SSR/edge layer. */
@Public()
@Controller("public/invitations/:slug")
export class PublicInvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get()
  get(@Param("slug") slug: string) {
    return this.invitations.getPublished(slug);
  }

  /** 5/hour/IP, honeypot field rejected silently in the schema layer. */
  @Throttle({ default: { limit: 5, ttl: 3600_000 } })
  @Post("rsvp")
  rsvp(@Param("slug") slug: string, @Body(new ZodValidationPipe(rsvpSchema)) dto: unknown) {
    return this.invitations.submitRsvp(slug, dto as never);
  }

  @Throttle({ default: { limit: 5, ttl: 3600_000 } })
  @Post("wishes")
  submitWish(@Param("slug") slug: string, @Body(new ZodValidationPipe(wishSchema)) dto: unknown) {
    return this.invitations.submitWish(slug, dto as never);
  }

  @Get("wishes")
  approvedWishes(@Param("slug") slug: string) {
    return this.invitations.listApprovedWishes(slug);
  }
}
