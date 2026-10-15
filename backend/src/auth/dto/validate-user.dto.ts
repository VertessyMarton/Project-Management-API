import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ValidateUserDto {
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
