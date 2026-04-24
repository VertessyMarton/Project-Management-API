import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('admin')
  @Get()
  async findAllUsers() {
    return this.adminService.findAllUser();
  }

  @Roles('admin')
  @Get(':userId')
  async findOneUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.findOneUser(userId);
  }

  @Roles('admin')
  @Patch(':userId/role')
  async setUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.setUserRole(userId, dto);
  }

  @Roles('admin')
  @Delete(':userId')
  async deleteuser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.deleteUser(userId);
  }
}
