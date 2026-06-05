import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { SendEmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(
      this.configService.getOrThrow<string>('RESEND_API_KEY'),
    );
  }

  async sendEmail(dto: SendEmailDto) {
    const { recipients, subject, html, text } = dto;

    const { error } = await this.resend.emails.send({
      from: this.configService.getOrThrow<string>('EMAIL_FROM'),
      to: [recipients],
      subject,
      html,
      text,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
