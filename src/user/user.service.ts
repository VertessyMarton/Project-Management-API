import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateMeDto } from './dto/update-me.dto';
import { ProjectRoleEnum } from 'src/project/enums/project-role.enum';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getMe(userId: number) {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async getUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user || user.role === 'admin') {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateMe(userId: number, dto: UpdateMeDto) {
    await this.userRepository.update(userId, dto);
    return this.userRepository.findOneBy({ id: userId });
  }
}
