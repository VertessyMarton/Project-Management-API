import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

export const RateLimit = (limit: number, ttl = 60_000) =>
  applyDecorators(
    Throttle({
      default: { limit, ttl },
    }),
  );

export const AuthLimit = () => RateLimit(5, 60_000);
export const RegisterLimit = () => RateLimit(3, 60 * 60_000);
export const RefreshLimit = () => RateLimit(30, 60_000);
export const OtpLimit = () => RateLimit(5, 10 * 60_000);
export const ResendOtpLimit = () => RateLimit(2, 10 * 60_000);
export const MutationLimit = () => RateLimit(30, 60_000);
export const ReadLimit = () => RateLimit(100, 60_000);
