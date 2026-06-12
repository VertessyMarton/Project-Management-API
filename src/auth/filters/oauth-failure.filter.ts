import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch(UnauthorizedException)
export class OAuthFailureRedirectFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    return response.redirect(
      this.configService.getOrThrow<string>('OAUTH_FAILURE_REDIRECT_URL'),
    );
  }
}
