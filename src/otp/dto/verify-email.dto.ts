import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'testemail@example.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '173826' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d+$/)
  otp: string;
}
