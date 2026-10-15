import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { OtpEnum } from './enums/otp.enum';
import { OtpService } from './otp.service';

describe('OtpService', () => {
  let service: OtpService;
  let userRepository: {
    findOne: jest.Mock;
    update: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let otpRepository: {
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let emailService: {
    sendEmail: jest.Mock;
  };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    otpRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };
    emailService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    service = new OtpService(
      userRepository as any,
      otpRepository as any,
      emailService as any,
    );
  });

  it('generates a six digit otp and stores only its hash', async () => {
    const user = { id: 1 };

    const otp = await service.generateOtp(user as any, OtpEnum.OTP);

    expect(otp).toMatch(/^\d{6}$/);
    expect(otpRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        user,
        type: OtpEnum.OTP,
        otpHash: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    );
    expect(otpRepository.save.mock.calls[0][0].otpHash).not.toBe(otp);
  });

  it('rejects expired or missing verification codes', async () => {
    otpRepository.findOne.mockResolvedValue(null);

    await expect(service.validateOtp(1, '123456')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('verifies an unverified user and removes their otp', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      status: 'unverified',
    };
    userRepository.findOne.mockResolvedValue(user);
    otpRepository.findOne.mockResolvedValue({
      otpHash: await bcrypt.hash('123456', 10),
    });

    await expect(
      service.verifyEmail({ email: 'test@example.com', otp: '123456' }),
    ).resolves.toEqual({ message: 'Email verified successfully' });
    expect(userRepository.update).toHaveBeenCalledWith(1, {
      status: 'verified',
    });
    expect(otpRepository.delete).toHaveBeenCalledWith({ user: { id: 1 } });
  });
});
