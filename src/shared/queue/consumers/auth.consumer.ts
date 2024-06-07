import { Process, Processor } from '@nestjs/bull';

import { AUTH_QUEUE_PROCESS_NAME } from '@modules/auth/constants/auth-queue.constant';
import { AuthQueueService } from '@modules/auth/services/auth-queue.service';
import { Job } from 'bull';
import { QUEUE_NAMES } from '../constants';

@Processor(QUEUE_NAMES.AUTH_QUEUE)
export class AuthConsumer {
    constructor(private readonly _authQueueService: AuthQueueService) {}    
   
    @Process(AUTH_QUEUE_PROCESS_NAME.SEND_FORGOT_PASSWORD_EMAIL)
    async sendForgotEmail(job: Job<unknown>) {
        const {data} = job;
        await this._authQueueService.handleSendForgetPasswordMail(data);
    }
}
