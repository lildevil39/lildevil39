import { Injectable, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class BusinessCardsService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(_projectId: string, _dto: Record<string, unknown>) {
    throw new NotImplementedException("businessCards.upsert: TODO — upsert BusinessCard by projectId");
  }
}
