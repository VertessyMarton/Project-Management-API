import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { OAuthStateService } from '../oauth-state.service';
import { OAuthProvider } from '../enums/oauth-provider.enum';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly oauthState: OAuthStateService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    if (/\/google\/callback\/?$/i.test(req.path)) {
      this.oauthState.verify(OAuthProvider.GOOGLE, req, res);
    }
    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    if (/\/google\/callback\/?$/i.test(req.path)) {
      return {};
    }
    const res = context.switchToHttp().getResponse<Response>();
    return { state: this.oauthState.issue(OAuthProvider.GOOGLE, res) };
  }

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Google OAuth failed');
    }

    return user;
  }
}
