import { AUTH_QUEUE_PROCESS_NAME } from "../constants/auth-queue.constant";
import { EmailService } from "@shared/email/email.service";
import { Injectable } from "@nestjs/common";
import { QUEUE_NAMES } from "@shared/queue/constants";
import { QueueService } from "@shared/queue/queue.service";

@Injectable()
export class AuthQueueService {
    constructor(
        private readonly _queueService: QueueService,
        private readonly _emailService: EmailService
    ) {}

    async addJobSendForgotPasswordMail(token: string, email: string) {
        await this._queueService.addJob<[token: string, email: string]>({
            queueName: QUEUE_NAMES.AUTH_QUEUE,
            processName: AUTH_QUEUE_PROCESS_NAME.SEND_FORGOT_PASSWORD_EMAIL,
            payload: { token, email },
        });
    }

    async handleSendForgetPasswordMail(data: any) {
        const {token, email } = data;
        await this._emailService.sendResetPasswordEmail(email, token);
    }
}