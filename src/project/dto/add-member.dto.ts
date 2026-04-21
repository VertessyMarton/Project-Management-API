import { IsEmail, IsEnum, IsString } from 'class-validator';
import { ProjectRoleEnum } from '../enums/project-role.enum';

export class addMemberDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsEnum(ProjectRoleEnum)
  @IsString()
  role: ProjectRoleEnum;
}
