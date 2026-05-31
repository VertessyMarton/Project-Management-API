import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: {
    getOrThrow: jest.Mock;
  };

  beforeEach(() => {
    configService = {
      getOrThrow: jest.fn((key: string) => {
        const config = {
          EMAIL_HOST: 'smtp.example.com',
          EMAIL_PORT: '587',
          EMAIL_USER: 'sender@example.com',
          EMAIL_PASS: 'password',
        };
        return config[key];
      }),
    };

    service = new EmailService(configService as unknown as ConfigService);
  });

  it('creates a nodemailer transport from email config', () => {
    service.emailTransport();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'sender@example.com',
        pass: 'password',
      },
    });
  });

  it('sends email with the configured sender', async () => {
    const sendMail = jest.fn().mockResolvedValue(undefined);
    jest
      .mocked(nodemailer.createTransport)
      .mockReturnValue({ sendMail } as any);

    await service.sendEmail({
      recipients: 'recipient@example.com',
      subject: 'Verify your email',
      html: '<p>Hello</p>',
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: 'sender@example.com',
      to: 'recipient@example.com',
      subject: 'Verify your email',
      html: '<p>Hello</p>',
    });
  });
});
