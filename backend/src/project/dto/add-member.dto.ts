import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { ProjectRoleEnum } from '../enums/project-role.enum';

export class AddMemberDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    example: ProjectRoleEnum.MEMBER,
    enum: [
      ProjectRoleEnum.ADMIN,
      ProjectRoleEnum.MEMBER,
      ProjectRoleEnum.VIEWER,
    ],
    description:
      'Project role to assign. The owner role is reserved for project creation and cannot be assigned through member endpoints.',
  })
  @IsEnum(ProjectRoleEnum)
  @IsString()
  role: ProjectRoleEnum;
}
