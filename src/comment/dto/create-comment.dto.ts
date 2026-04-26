import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Looks ready to ship.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  content: string;
}
