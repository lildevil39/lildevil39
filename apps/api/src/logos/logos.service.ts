import { Injectable, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

/** Logo generation needs LogoGenerationProvider — see jobs/ for the honest-mock contract. */
@Injectable()
export class LogosService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(_projectId: string, _dto: Record<string, unknown>) {
    throw new NotImplementedException("logos.upsert: TODO — upsert LogoProject by projectId");
  }
}
