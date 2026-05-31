import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { OtpEnum } from '../otp/enums/otp.enum';
import { UserRoleEnum } from '../user/enums/user-role.enum';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let jwtService: {
    sign: jest.Mock;
  };
  let otpService: {
    generateOtp: jest.Mock;
  };
  let emailService: {
    sendEmail: jest.Mock;
  };

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };
    otpService = {
      generateOtp: jest.fn(),
    };
    emailService = {
      sendEmail: jest.fn().mockResolvedValue(undefined),
    };

    service = new AuthService(
      userRepository as any,
      { secret: 'refresh-secret', expiresIn: '7d' } as any,
      jwtService as any,
      otpService as any,
      emailService as any,
    );
  });

  it('rejects duplicate emails during registration', async () => {
    userRepository.findOne.mockResolvedValue({ id: 1 });

    await expect(
      service.createUser('Test User', 'test@example.com', 'secret'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('creates a user, generates an otp, and sends verification email', async () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed',
    };
    userRepository.findOne.mockResolvedValue(null);
    userRepository.save.mockResolvedValue(user);
    otpService.generateOtp.mockResolvedValue('123456');

    await expect(
      service.createUser('Test User', 'test@example.com', 'secret'),
    ).resolves.toBe(user);

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        password: expect.any(String),
      }),
    );
    expect(otpService.generateOtp).toHaveBeenCalledWith(user, OtpEnum.OTP);
    expect(emailService.sendEmail).toHaveBeenCalled();
  });

  it('returns a user without password when credentials are valid', async () => {
    const password = await bcrypt.hash('secret', 10);
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password,
      role: UserRoleEnum.USER,
    });

    await expect(
      service.validateUser({ email: 'test@example.com', password: 'secret' }),
    ).resolves.toEqual({
      id: 1,
      email: 'test@example.com',
      role: UserRoleEnum.USER,
    });
  });

  it('does not log in unverified users', async () => {
    await expect(
      service.login({
        id: 1,
        email: 'test@example.com',
        role: UserRoleEnum.USER,
        status: 'unverified',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
