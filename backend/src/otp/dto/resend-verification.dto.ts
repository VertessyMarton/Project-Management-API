import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ example: 'testemail@example.com' })
  @IsString()
  @IsEmail()
  email: string;
}
