import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import type { LoginResult } from '../types/login-result.type';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-signature',
  })
  accessToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  constructor(login: any) {
    this.accessToken = login.accessToken;
    this.user = new UserResponseDto(login.user);
  }
}
