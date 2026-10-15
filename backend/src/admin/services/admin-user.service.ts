import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { AdminUserQueryDto } from '../dto/admin.user-query.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async setUserRole(userId: number, dto: UpdateUserRoleDto) {
    const user = await this.userRepository.update(userId, { role: dto.role });
    if (user.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.findOne({ where: { id: userId } });
  }

  async deleteUser(userId: number) {
    const user = await this.userRepository.delete(userId);
    if (user.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'user deleted' };
  }
}
