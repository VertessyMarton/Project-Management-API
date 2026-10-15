import { ApiProperty } from '@nestjs/swagger';
import type { User } from 'src/user/entities/user.entity';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';

export type UserResponseSource = Pick<User, 'id' | 'email' | 'role'>;

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'testemail@example.com' })
  email: string;

  @ApiProperty({ example: 'user', enum: UserRoleEnum })
  role: UserRoleEnum;

  constructor(user: UserResponseSource) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role;
  }
}
