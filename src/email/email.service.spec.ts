import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
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
  let configService: {
    get: jest.Mock;
    getOrThrow: jest.Mock;
  };

  const createService = (provider = 'resend') => {
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const config = {
          EMAIL_PROVIDER: provider,
        };

        return config[key] ?? defaultValue;
      }),
      getOrThrow: jest.fn((key: string) => {
        const config = {
          RESEND_API_KEY: 're_test_api_key',
          EMAIL_FROM: 'Project Manager <auth@example.com>',
        };

        return config[key];
      }),
    };

    return new EmailService(configService as unknown as ConfigService);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a Resend client with the configured API key in resend mode', () => {
    createService('resend');

    expect(Resend).toHaveBeenCalledWith('re_test_api_key');
  });

  it('sends email with the configured sender in resend mode', async () => {
    const service = createService('resend');
    sendMock.mockResolvedValue({ data: { id: 'email-id' }, error: null });

    await service.sendEmail({
      recipients: 'recipient@example.com',
      subject: 'Verify your email',
      html: '<p>Hello</p>',
      text: 'Hello',
      devMessage: 'Verification code for recipient@example.com: 123456',
    });

    expect(sendMock).toHaveBeenCalledWith({
      from: 'Project Manager <auth@example.com>',
      to: ['recipient@example.com'],
      subject: 'Verify your email',
      html: '<p>Hello</p>',
      text: 'Hello',
    });
  });

  it('logs the dev message and does not create a Resend client in console mode', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const service = createService('console');

    await service.sendEmail({
      recipients: 'recipient@example.com',
      subject: 'Verify your email',
      html: '<p>Hello</p>',
      devMessage: 'Verification code for recipient@example.com: 123456',
    });

    expect(Resend).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(
      'Verification code for recipient@example.com: 123456',
    );

    logSpy.mockRestore();
  });

  it('throws when Resend returns an error', async () => {
    const service = createService('resend');
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

  it('throws for unsupported email providers', async () => {
    const service = createService('unsupported');

    await expect(
      service.sendEmail({
        recipients: 'recipient@example.com',
        subject: 'Verify your email',
        html: '<p>Hello</p>',
      }),
    ).rejects.toThrow('Unsupported EMAIL_PROVIDER: unsupported');
  });
});
