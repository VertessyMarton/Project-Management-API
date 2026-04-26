import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import type { LoginResult } from '../types/login-result.type';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-signature',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-signature',
  })
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  constructor(login: LoginResult) {
    this.accessToken = login.accessToken;
    this.refreshToken = login.refreshToken;
    this.user = new UserResponseDto(login.user);
  }
}
