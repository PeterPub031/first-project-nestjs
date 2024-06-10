import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { QUEUE_NAMES } from "./constants";
import { Queue } from "bull";

@Injectable()
export class QueueService {
  constructor(@InjectQueue(QUEUE_NAMES.AUTH_QUEUE) private _authQueue: Queue) {}

  async addJob<T>(job: any) {
    const { processName, payload } = job;
    // console.log(job)
    // if(queueName == QUEUE_NAMES.AUTH_QUEUE && AUTH_QUEUE_PROCESS_NAME.SEND_FORGOT_PASSWORD_EMAIL) {
    await this._authQueue.add(processName, {
      ...payload,
    });
    // }
  }
}
