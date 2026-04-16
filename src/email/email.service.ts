import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { sendEmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  emailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('EMAIL_HOST'),
      port: Number(this.configService.getOrThrow<string>('EMAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.getOrThrow<string>('EMAIL_USER'),
        pass: this.configService.getOrThrow<string>('EMAIL_PASS'),
      },
    });
    return transporter;
  }

  async sendEmail(dto: sendEmailDto) {
    const { recipients, subject, html } = dto;
    const transport = this.emailTransport();

    const options: nodemailer.SendMailOptions = {
      from: this.configService.getOrThrow<string>('EMAIL_USER'),
      to: recipients,
      subject: subject,
      html: html,
    };

    await transport.sendMail(options);
  }
}
