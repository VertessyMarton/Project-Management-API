import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({ example: UserRoleEnum.ADMIN, enum: UserRoleEnum })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
