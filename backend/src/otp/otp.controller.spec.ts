import { OtpController } from './otp.controller';

describe('OtpController', () => {
  let controller: OtpController;
  let otpService: {
    verifyEmail: jest.Mock;
    resendEmailVerification: jest.Mock;
  };

  beforeEach(() => {
    otpService = {
      verifyEmail: jest.fn(),
      resendEmailVerification: jest.fn(),
    };

    controller = new OtpController(otpService as any);
  });

  it('delegates email verification to the otp service', () => {
    const dto = { email: 'test@example.com', otp: '123456' };
    const response = { message: 'Email verified successfully' };
    otpService.verifyEmail.mockReturnValue(response);

    expect(controller.verifyEmail(dto)).toBe(response);
    expect(otpService.verifyEmail).toHaveBeenCalledWith(dto);
  });

  it('delegates verification resend to the otp service', () => {
    const dto = { email: 'test@example.com' };
    const response = {
      message:
        'If an account exists and requires verification, a code will be sent',
    };
    otpService.resendEmailVerification.mockReturnValue(response);

    expect(controller.resendEmailVerification(dto)).toBe(response);
    expect(otpService.resendEmailVerification).toHaveBeenCalledWith(dto);
  });
});
