import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';
import { OAuthProvider } from './enums/oauth-provider.enum';

const STATE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class OAuthStateService {
  constructor(private readonly config: ConfigService) {}

  private cookieOptions(provider: OAuthProvider): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      signed: true,
      path: `/api/auth/${provider}/callback`,
    };
  }

  issue(provider: OAuthProvider, res: Response): string {
    const state = randomBytes(32).toString('hex');
    res.cookie(
      `oauth_state_${provider}`,
      JSON.stringify({ state, expiresAt: Date.now() + STATE_TTL_MS }),
      { ...this.cookieOptions(provider), maxAge: STATE_TTL_MS },
    );
    return state;
  }

  verify(provider: OAuthProvider, req: Request, res: Response): void {
    const name = `oauth_state_${provider}`;
    const cookie: unknown = req.signedCookies?.[name];
    res.clearCookie(name, this.cookieOptions(provider));

    try {
      if (typeof cookie !== 'string' || typeof req.query.state !== 'string') {
        throw new Error('Missing state');
      }
      const stored = JSON.parse(cookie) as {
        state?: unknown;
        expiresAt?: unknown;
      };
      if (
        typeof stored.state !== 'string' ||
        !/^[a-f0-9]{64}$/.test(stored.state) ||
        !/^[a-f0-9]{64}$/.test(req.query.state) ||
        typeof stored.expiresAt !== 'number' ||
        !Number.isFinite(stored.expiresAt) ||
        stored.expiresAt <= Date.now() ||
        stored.expiresAt > Date.now() + STATE_TTL_MS ||
        !timingSafeEqual(
          Buffer.from(stored.state),
          Buffer.from(req.query.state),
        )
      ) {
        throw new Error('Invalid state');
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired OAuth state');
    }
  }
}
