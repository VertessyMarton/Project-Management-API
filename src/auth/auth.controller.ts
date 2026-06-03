import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { RegisterDto } from './dto/register.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { SwaggerRegisterDocs } from 'src/common/decorators/swagger/register-docs.decorator';
import { LoginResponseDto } from './dto/login-response.dto';
import { SwaggerLoginDocs } from 'src/common/decorators/swagger/login-docs.decorator';
import { SwaggerRefreshDocs } from 'src/common/decorators/swagger/refresh-docs.decorator';
import {
  AuthLimit,
  RefreshLimit,
  RegisterLimit,
} from 'src/common/decorators/rate-limit.decorator';
import { RefreshTokenService } from './refresh-token.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshService: RefreshTokenService,
  ) {}

  @SwaggerRegisterDocs()
  @RegisterLimit()
  @Post('register')
  async createUser(@Body() dto: RegisterDto) {
    const user = await this.authService.createUser(
      dto.name,
      dto.email,
      dto.password,
    );
    return new RegisterResponseDto(user);
  }

  @SwaggerLoginDocs()
  @HttpCode(200)
  @AuthLimit()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { accessToken, refreshToken } = await this.authService.login(
      req.user,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return new LoginResponseDto({
      accessToken,
      user: req.user,
    });
  }

  @SwaggerRefreshDocs()
  @HttpCode(200)
  @RefreshLimit()
  @Post('refresh')
  async refreshToken(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { id, accessToken, refreshToken } =
      await this.refreshService.refreshToken(req.cookies.refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth',
    });

    return {
      id: id,
      accessToken: accessToken,
    };
  }

  @HttpCode(200)
  @RefreshLimit()
  @Post('logout')
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.refreshService.revokeRefreshToken(req.cookies.refreshToken);

    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth',
    });

    return { message: 'Token revoked' };
  }
}
