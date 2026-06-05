import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { SendEmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: string;
  private readonly resend?: Resend;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('EMAIL_PROVIDER', 'console');

    if (this.provider === 'resend') {
      this.resend = new Resend(
        this.configService.getOrThrow<string>('RESEND_API_KEY'),
      );
    }
  }

  async sendEmail(dto: SendEmailDto) {
    if (this.provider === 'console') {
      this.logger.log(
        dto.devMessage ?? `Email to ${dto.recipients}: ${dto.subject}`,
      );
      return;
    }

    if (this.provider === 'resend') {
      const { error } = await this.resend!.emails.send({
        from: this.configService.getOrThrow<string>('EMAIL_FROM'),
        to: [dto.recipients],
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return;
    }

    throw new Error(`Unsupported EMAIL_PROVIDER: ${this.provider}`);
  }
}
