import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website redesign' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Refresh landing page and dashboard flows' })
  @IsString()
  @MaxLength(1000)
  description: string;
}
