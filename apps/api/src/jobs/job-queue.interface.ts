import type { JobType } from "@nivora/shared";

export interface JobQueue {
  /** Enqueue work; the worker resolves the right AIProvider, updates status, writes outputs, notifies. */
  enqueue(input: { projectId: string; type: JobType; input: Record<string, unknown> }): Promise<{ jobId: string }>;
}

export const JOB_QUEUE_TOKEN = "JOB_QUEUE_TOKEN";
