import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID } from 'crypto';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenEnum } from './enums/refresh-token.enum';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async createRefreshToken(userId: number, familyId: string) {
    const tokenId = randomUUID();
    const secret = randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshToken = `${tokenId}.${secret}`;

    await this.refreshRepository.save({
      id: tokenId,
      user: { id: userId },
      hashedRefreshToken: await bcrypt.hash(secret, 12),
      expiresAt: expiresAt,
      familyId: familyId,
    });

    return refreshToken;
  }

  async isTokenDefined(refreshToken: string) {
    const [tokenId, secret] = refreshToken.split('.');

    if (!tokenId || !secret) {
      throw new UnauthorizedException('Invalid token');
    }

    const record = await this.refreshRepository.findOne({
      where: {
        id: tokenId,
      },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid token');
    }

    return record;
  }

  async isTokenValid(refreshToken: string, definedToken: RefreshToken) {
    const [, secret] = refreshToken.split('.');

    if (definedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid token');
    }

    const valid = await bcrypt.compare(secret, definedToken.hashedRefreshToken);

    if (!valid) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async revokeRefreshToken(oldRefreshToken: string) {
    const [tokenId, secret] = oldRefreshToken.split('.');

    const definedToken = await this.isTokenDefined(oldRefreshToken);

    if (definedToken.revoked) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.isTokenValid(oldRefreshToken, definedToken);

    await this.refreshRepository.update(tokenId, {
      revoked: true,
      revokedAt: new Date(),
      revokedReason: RefreshTokenEnum.LOGOUT,
    });
  }

  async rotateRefreshToken(oldRefreshToken: string, userId: number) {
    const [tokenId, ,] = oldRefreshToken.split('.');

    const definedToken = await this.isTokenDefined(oldRefreshToken);

    if (definedToken.revoked) {
      if (definedToken.revokedReason === RefreshTokenEnum.ROTATED) {
        await this.refreshRepository.update(
          { familyId: definedToken.familyId },
          {
            revoked: true,
            revokedAt: new Date(),
            revokedReason: RefreshTokenEnum.REUSE_DETECTED,
          },
        );
      }
      throw new UnauthorizedException('Invalid token');
    }

    await this.isTokenValid(oldRefreshToken, definedToken);

    await this.refreshRepository.update(tokenId, {
      revoked: true,
      revokedAt: new Date(),
      revokedReason: RefreshTokenEnum.ROTATED,
    });

    const newRefreshToken = await this.createRefreshToken(
      userId,
      definedToken.familyId,
    );

    return {
      refreshToken: newRefreshToken,
    };
  }

  async refreshToken(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const [tokenId, ,] = oldRefreshToken.split('.');

    const record = await this.refreshRepository.findOne({
      where: { id: tokenId },
      relations: {
        user: true,
      },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid token');
    }

    const rotate = await this.rotateRefreshToken(
      oldRefreshToken,
      record.user.id,
    );

    const payload = { sub: record?.user.id, role: record?.user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      id: record?.user.id,
      accessToken: accessToken,
      refreshToken: rotate.refreshToken,
    };
  }
}
