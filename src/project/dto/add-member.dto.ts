import { IsEmail, IsEnum, IsString } from 'class-validator';
import { ProjectRoleEnum } from '../enums/project-role.enum';

export class AddMemberDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsEnum(ProjectRoleEnum)
  @IsString()
  role: ProjectRoleEnum;
}
