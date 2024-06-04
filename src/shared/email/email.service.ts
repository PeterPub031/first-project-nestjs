import * as nodemailer from 'nodemailer';

import { CONFIG_VAR } from '@config/index';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendResetPasswordEmail(email: string, resetCode: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', 
      port: 587, 
      secure: false, 
      auth: {
        user: 'testitnestjs@gmail.com', 
        pass: 'btkdjgvvxqyyyxhg',
      },
    });
    const mailOptions = {
      from: 'testitnestjs@gmail.com',
      to: email,
      subject: 'Reset Password',
      text: `Please use the following code to reset your password: ${resetCode}`,
    };

    await transporter.sendMail(mailOptions);
  }
}
