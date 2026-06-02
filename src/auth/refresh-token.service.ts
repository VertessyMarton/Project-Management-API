import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID } from 'crypto';
import { refreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(refreshToken)
    private refreshRepository: Repository<refreshToken>,
    private jwtService: JwtService,
  ) {}

  async createRefreshToken(userId: number | undefined) {
    const tokenId = randomUUID();
    const secret = randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshToken = `${tokenId}.${secret}`;

    await this.refreshRepository.save({
      id: tokenId,
      user: { id: userId },
      hashedRefreshToken: await bcrypt.hash(secret, 12),
      expiresAt: expiresAt,
    });

    return refreshToken;
  }

  async revokeRefreshToken(refreshToken: string) {
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

    const valid = await bcrypt.compare(secret, record.hashedRefreshToken);

    if (!valid) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.refreshRepository.update(tokenId, { revoked: true });
  }

  async rotateRefreshToken(refreshToken: string, userId: number | undefined) {
    const [tokenId, secret] = refreshToken.split('.');

    if (!tokenId || !secret) {
      throw new UnauthorizedException('Invalid token');
    }

    const record = await this.refreshRepository.findOne({
      where: { id: tokenId },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid token');
    }

    if (record.revoked) {
      throw new UnauthorizedException('Invalid token');
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid token');
    }

    const valid = await bcrypt.compare(secret, record.hashedRefreshToken);

    if (!valid) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.refreshRepository.update(tokenId, { revoked: true });

    const newRefreshToken = await this.createRefreshToken(userId);

    return {
      refreshToken: newRefreshToken,
    };
  }

  async refreshToken(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Invalid token');
    }
    const [tokenId, secret] = oldRefreshToken.split('.');

    const record = await this.refreshRepository.findOne({
      where: { id: tokenId },
      relations: {
        user: true,
      },
    });

    const rotate = await this.rotateRefreshToken(
      oldRefreshToken,
      record?.user.id,
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
