import { Inject, Injectable } from "@nestjs/common";
import type { JobType } from "@nivora/shared";
import { PrismaService } from "../prisma/prisma.service.js";
import { JOB_QUEUE_TOKEN, type JobQueue } from "./job-queue.interface.js";

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(JOB_QUEUE_TOKEN) private readonly queue: JobQueue,
  ) {}

  /**
   * Wedding invitations don't need this path — publish() renders
   * synchronously. This is for VIDEO_GENERATE / LOGO_GENERATE /
   * BRAND_GENERATE / CV_PDF / CARD_RENDER, which throw
   * ProviderNotConfiguredException (409) until a provider is set.
   */
  generate(projectId: string, type: JobType) {
    return this.queue.enqueue({ projectId, type, input: {} });
  }

  get(id: string) {
    return this.prisma.generationJob.findUnique({ where: { id } });
  }

  listForProject(projectId: string) {
    return this.prisma.generationJob.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
  }
}
