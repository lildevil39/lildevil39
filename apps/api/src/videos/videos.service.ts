import { Injectable, NotImplementedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

/**
 * Video generation needs an AI provider (see jobs/VideoGenerationProvider).
 * With none configured, submit() throws ProviderNotConfiguredException and
 * the job row stays FAILED with an honest "AI provider not configured"
 * message — never a fake result.
 */
@Injectable()
export class VideosService {
  constructor(private readonly prisma: PrismaService) {}

  upsert(_projectId: string, _dto: Record<string, unknown>) {
    throw new NotImplementedException("videos.upsert: TODO — upsert VideoProject by projectId");
  }

  upsertScenes(_projectId: string, _scenes: unknown[]) {
    throw new NotImplementedException(
      "videos.upsertScenes: TODO — replace VideoScene[] (index, kind, text, fileId, durationMs, transition)",
    );
  }
}
