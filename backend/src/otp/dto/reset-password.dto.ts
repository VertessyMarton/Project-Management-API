import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'selector.secret' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newPassword1234!' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  newPassword: string;
}
