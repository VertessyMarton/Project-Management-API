import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateMeDto {
  @ApiProperty({ example: 'Test User' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[\p{L}][\p{L}\p{M}'\-.]*(?: [\p{L}\p{M}'\-.]+)*$/u)
  name: string;
}
