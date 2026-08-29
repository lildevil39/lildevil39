import { Injectable, NotImplementedException } from "@nestjs/common";
import type { JobType } from "@nivora/shared";
import type { JobQueue } from "../job-queue.interface.js";

/** Prod queue, backed by Redis via BullMQ. Selected when QUEUE_DRIVER=bullmq. */
@Injectable()
export class BullMqQueue implements JobQueue {
  async enqueue(_input: {
    projectId: string;
    type: JobType;
    input: Record<string, unknown>;
  }): Promise<{ jobId: string }> {
    throw new NotImplementedException(
      "BullMqQueue.enqueue: TODO — connect to REDIS_URL, add job to a BullMQ Queue, worker process mirrors InProcessQueue's status walk",
    );
  }
}
