import { Injectable, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

/** CV generation is a synchronous PDF render (CV_PDF job) — no AI provider required. */
@Injectable()
export class CvService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(_projectId: string, _dto: Record<string, unknown>) {
    throw new NotImplementedException(
      "cv.upsert: TODO — upsert CvProject by projectId (education/experience/skills/etc. are JSON arrays)",
    );
  }
}
