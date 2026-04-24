import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ValidateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;
}
