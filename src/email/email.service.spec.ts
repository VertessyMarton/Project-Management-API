import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailService } from './email.service';

const sendMock = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: sendMock,
    },
  })),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: {
    getOrThrow: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    configService = {
      getOrThrow: jest.fn((key: string) => {
        const config = {
          RESEND_API_KEY: 're_test_api_key',
          EMAIL_FROM: 'Project Manager <auth@example.com>',
        };

        return config[key];
      }),
    };

    service = new EmailService(configService as unknown as ConfigService);
  });

  it('creates a Resend client with the configured API key', () => {
    expect(Resend).toHaveBeenCalledWith('re_test_api_key');
  });

  it('sends email with the configured sender', async () => {
    sendMock.mockResolvedValue({ data: { id: 'email-id' }, error: null });

    await service.sendEmail({
      recipients: 'recipient@example.com',
      subject: 'Verify your email',
      html: '<p>Hello</p>',
      text: 'Hello',
    });

    expect(sendMock).toHaveBeenCalledWith({
      from: 'Project Manager <auth@example.com>',
      to: ['recipient@example.com'],
      subject: 'Verify your email',
      html: '<p>Hello</p>',
      text: 'Hello',
    });
  });

  it('throws when Resend returns an error', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: 'Invalid API key' },
    });

    await expect(
      service.sendEmail({
        recipients: 'recipient@example.com',
        subject: 'Verify your email',
        html: '<p>Hello</p>',
      }),
    ).rejects.toThrow('Failed to send email: Invalid API key');
  });
});
