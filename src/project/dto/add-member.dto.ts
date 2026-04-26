import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { ProjectRoleEnum } from '../enums/project-role.enum';

export class AddMemberDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ example: ProjectRoleEnum.MEMBER, enum: ProjectRoleEnum })
  @IsEnum(ProjectRoleEnum)
  @IsString()
  role: ProjectRoleEnum;
}
