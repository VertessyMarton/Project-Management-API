import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class RemoveMemberDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  @IsString()
  email: string;
}
