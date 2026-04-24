import { IsEnum } from 'class-validator';
import { UserRoleEnum } from 'src/user/enums/user-role.enum';

export class UpdateUserRoleDto {
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;
}
