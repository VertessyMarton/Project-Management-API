import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { getExclusiveUpperDate } from '../utils/date-range.util';
import { OauthAccount } from 'src/auth/entities/oauth-account.entity';
import { AdminOauthQueryDto } from '../dto/admin.oauth-query.dto';

@Injectable()
export class AdminOauthService {
  constructor(
    @InjectRepository(OauthAccount)
    private readonly oauthRepository: Repository<OauthAccount>,
  ) {}

  async findAllOauthUsers(
    query: AdminOauthQueryDto = new AdminOauthQueryDto(),
  ) {
    const normalizedQuery = Object.assign(new AdminOauthQueryDto(), query);

    const {
      page,
      limit,
      q,
      provider,
      userId,
      providerId,
      linkedFrom,
      linkedTo,
      sortBy,
      sortOrder,
    } = normalizedQuery;

    const qb = this.oauthRepository.createQueryBuilder('oauth');

    const term = q?.trim();

    if (term) {
      qb.andWhere(
        new Brackets((searchQb) => {
          searchQb.where('oauth.email ILIKE :term', {
            term: `%${term}%`,
          });
        }),
      );
    }

    if (provider !== undefined) {
      qb.andWhere('oauth.provider = :provider', { provider });
    }

    if (userId !== undefined) {
      qb.andWhere('oauth.userId = :userId', { userId });
    }

    if (providerId !== undefined) {
      qb.andWhere('oauth.providerUserId = :providerId', { providerId });
    }

    if (linkedFrom) {
      qb.andWhere('oauth.linkedAt >= :linkedFrom', {
        linkedFrom: new Date(linkedFrom),
      });
    }

    if (linkedTo) {
      const createdToExclusive = getExclusiveUpperDate(linkedTo);

      qb.andWhere('oauth.linkedAt < :linkedTo', {
        linkedTo: createdToExclusive,
      });
    }

    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    qb.orderBy(`oauth.${sortBy}`, direction)
      .addOrderBy('oauth.id', direction)
      .skip((page - 1) * limit)
      .take(limit);

    const [oauthUsers, total] = await qb.getManyAndCount();

    return {
      data: oauthUsers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
