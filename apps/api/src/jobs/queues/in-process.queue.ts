import { Injectable, NotImplementedException } from "@nestjs/common";
import type { JobType } from "@nivora/shared";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { JobQueue } from "../job-queue.interface.js";

/**
 * Dev queue: setTimeout + DB polling, no Redis required. Idempotent by
 * (projectId, type, inputHash) — see enqueue() TODO.
 */
@Injectable()
export class InProcessQueue implements JobQueue {
  constructor(private readonly prisma: PrismaService) {}

  async enqueue(_input: {
    projectId: string;
    type: JobType;
    input: Record<string, unknown>;
  }): Promise<{ jobId: string }> {
    throw new NotImplementedException(
      "InProcessQueue.enqueue: TODO — hash input, create/find GenerationJob row (dedup), setTimeout worker that resolves the right AIProvider and walks QUEUED -> PROCESSING -> COMPLETED|FAILED",
    );
  }
}
