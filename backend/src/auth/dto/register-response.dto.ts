import { User } from 'src/user/entities/user.entity';
import { ApiCreatedResponse, ApiProperty } from '@nestjs/swagger';

@ApiCreatedResponse()
export class RegisterResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'testemail@example.com' })
  email: string;

  @ApiProperty({ example: 'Test User' })
  name: string;

  @ApiProperty({ example: 'unverified' })
  status: string;

  @ApiProperty({ example: '2026-04-25T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-25T10:30:00.000Z' })
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.status = user.status;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
