import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomUUID, UUID } from 'crypto';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenEnum } from './enums/refresh-token.enum';
import { AuditCategory } from 'src/audit-log/enums/log-category.enum';
import { AuditTargetType } from 'src/audit-log/enums/log-target-type.enum';
import { AuditOutcome } from 'src/audit-log/enums/log-outcome.enum';
import { AuditLogService } from 'src/audit-log/audit-log.service';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private auditService: AuditLogService,
    private dataSource: DataSource,
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

  async revokeRefreshToken(oldRefreshToken: string, requestId: UUID) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('No token provided');
    }

    const [tokenId, secret] = oldRefreshToken.split('.');

    const definedToken = await this.isTokenDefined(oldRefreshToken);

    if (definedToken.revoked) {
      throw new UnauthorizedException('Invalid token');
    }

    await this.isTokenValid(oldRefreshToken, definedToken);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(RefreshToken).update(tokenId, {
        revoked: true,
        revokedAt: new Date(),
        revokedReason: RefreshTokenEnum.LOGOUT,
      });

      await this.auditService.record(
        {
          category: AuditCategory.SECURITY,
          action: 'security.refresh_token.logout',
          actorId: definedToken.userId,
          targetType: AuditTargetType.USER,
          targetId: definedToken.userId,
          outcome: AuditOutcome.SUCCESS,
          metadata: {
            tokenId: definedToken.userId,
            familyId: definedToken.familyId,
            reason: 'LOGOUT',
            familyRevoked: true,
          },
          requestId,
        },
        manager,
      );
    });
  }

  async rotateRefreshToken(
    oldRefreshToken: string,
    userId: number,
    requestId: UUID,
  ) {
    const [tokenId, ,] = oldRefreshToken.split('.');

    const definedToken = await this.isTokenDefined(oldRefreshToken);

    if (definedToken.revoked) {
      if (definedToken.revokedReason === RefreshTokenEnum.ROTATED) {
        await this.dataSource.transaction(async (manager) => {
          await manager.getRepository(RefreshToken).update(
            { familyId: definedToken.familyId },
            {
              revoked: true,
              revokedAt: new Date(),
              revokedReason: RefreshTokenEnum.REUSE_DETECTED,
            },
          );

          await this.auditService.record(
            {
              category: AuditCategory.SECURITY,
              action: 'security.refresh_token.reuse_detected',
              actorId: null,
              targetType: AuditTargetType.USER,
              targetId: userId,
              outcome: AuditOutcome.DENIED,
              metadata: {
                familyId: definedToken.familyId,
                reason: 'TOKEN_REUSE',
                familyRevoked: true,
              },
              requestId,
            },
            manager,
          );
        });
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

  async refreshToken(oldRefreshToken: string, requestId: UUID) {
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
      requestId,
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
