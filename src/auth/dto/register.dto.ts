import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Test User' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[\p{L}][\p{L}\p{M}'\-.]*(?: [\p{L}\p{M}'\-.]+)*$/u)
  name: string;

  @ApiProperty({ example: 'testemail@example.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'testpasswd' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;
}
