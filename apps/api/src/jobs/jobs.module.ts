import { Module } from "@nestjs/common";
import { JobsController } from "./jobs.controller.js";
import { JobsService } from "./jobs.service.js";
import { JOB_QUEUE_TOKEN } from "./job-queue.interface.js";
import { InProcessQueue } from "./queues/in-process.queue.js";
import { BullMqQueue } from "./queues/bullmq.queue.js";

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    InProcessQueue,
    BullMqQueue,
    {
      provide: JOB_QUEUE_TOKEN,
      useFactory: (inProcess: InProcessQueue, bullMq: BullMqQueue) =>
        (process.env.QUEUE_DRIVER ?? "inprocess") === "bullmq" ? bullMq : inProcess,
      inject: [InProcessQueue, BullMqQueue],
    },
  ],
  exports: [JobsService],
})
export class JobsModule {}
