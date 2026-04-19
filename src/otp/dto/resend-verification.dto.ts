import { IsEmail, IsString } from 'class-validator';

export class resendVerificationDto {
  @IsString()
  @IsEmail()
  email: string;
}
