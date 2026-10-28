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
export class MicrosoftAuthGuard extends AuthGuard('microsoft') {
  constructor(private readonly oauthState: OAuthStateService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    if (/\/microsoft\/callback\/?$/i.test(req.path)) {
      this.oauthState.verify(OAuthProvider.MICROSOFT, req, res);
    }
    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    if (/\/microsoft\/callback\/?$/i.test(req.path)) {
      return {};
    }
    const res = context.switchToHttp().getResponse<Response>();
    return { state: this.oauthState.issue(OAuthProvider.MICROSOFT, res) };
  }

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Microsoft OAuth failed');
    }

    return user;
  }
}
