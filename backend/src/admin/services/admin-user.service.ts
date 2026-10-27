import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { AdminUserQueryDto } from '../dto/admin.user-query.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { AuditLogService } from 'src/audit-log/audit-log.service';
import { AuditCategory } from 'src/audit-log/enums/log-category.enum';
import { AuditTargetType } from 'src/audit-log/enums/log-target-type.enum';
import { UUID } from 'crypto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private auditService: AuditLogService,
  ) {}

  async findAllUser(query: AdminUserQueryDto = new AdminUserQueryDto()) {
    const normalizedQuery = Object.assign(new AdminUserQueryDto(), query);
    const { page, limit, role, status, q, sortBy, sortOrder } = normalizedQuery;
    const term = q?.trim();

    const baseWhere: FindOptionsWhere<User> = {};

    if (role !== undefined) {
      baseWhere.role = role;
    }
    if (status !== undefined) {
      baseWhere.status = status;
    }

    const where: FindOptionsWhere<User>[] | FindOptionsWhere<User> = term
      ? [
          { ...baseWhere, name: ILike(`%${term}%`) },
          { ...baseWhere, email: ILike(`%${term}%`) },
        ]
      : baseWhere;

    const [users, total] = await this.userRepository.findAndCount({
      where,
      order: {
        [sortBy]: sortOrder,
        id: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async setUserRole(
    userId: number,
    dto: UpdateUserRoleDto,
    actorId: number,
    requestId: UUID,
  ) {
    return this.auditService.run(
      {
        category: AuditCategory.ADMIN,
        action: 'admin.user.changeRole',
        actorId,
        targetType: AuditTargetType.USER,
        targetId: userId,
        requestId,
      },
      async (manager, audit) => {
        const users = manager.getRepository(User);
        const user = await users.findOne({
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }
        if (user.role === dto.role) {
          throw new NotFoundException('User not found');
        }

        audit.setMetadata({
          role: {
            from: user.role,
            to: dto.role,
          },
        });
        await users.update(userId, { role: dto.role });
        return {
          ...user,
          role: dto.role,
        };
      },
    );
  }

  async deleteUser(userId: number, actorId: number, requestId: UUID) {
    return this.auditService.run(
      {
        category: AuditCategory.ADMIN,
        action: 'admin.user.delete',
        actorId,
        targetType: AuditTargetType.USER,
        targetId: userId,
        requestId,
      },
      async (manager, audit) => {
        const users = manager.getRepository(User);
        const user = await users.findOne({
          where: { id: userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        audit.setMetadata({ name: user.name });
        await users.delete(userId);
        return { message: 'user deleted' };
      },
    );
  }
}
