import { Injectable, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class BrandingService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(_projectId: string, _dto: Record<string, unknown>) {
    throw new NotImplementedException("branding.upsert: TODO — upsert BrandProject by projectId");
  }
}
