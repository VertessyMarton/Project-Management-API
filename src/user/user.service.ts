import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateMeDto } from './dto/update-me.dto';

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
    return await this.userRepository.findOne({
      where: { id: id },
    });
  }

  async updateMe(userId: number, dto: UpdateMeDto) {
    await this.userRepository.update(userId, dto);
    return this.userRepository.findOneBy({ id: userId });
  }
}
