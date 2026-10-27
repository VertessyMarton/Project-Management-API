import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import {
  AdminDeleteUserDocs,
  AdminFindAllUsersDocs,
  AdminFindOneUserDocs,
  AdminSetUserRoleDocs,
} from 'src/common/decorators/swagger/admin-user-docs.decorator';
import { AdminUserQueryDto } from '../dto/admin.user-query.dto';
import { AdminUserService } from '../services/admin-user.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly adminService: AdminUserService) {}

  @AdminFindAllUsersDocs()
  @Roles('admin')
  @Get()
  async findAllUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.findAllUser(query);
  }

  @AdminFindOneUserDocs()
  @Roles('admin')
  @Get(':userId')
  async findOneUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.findOneUser(userId);
  }

  @AdminSetUserRoleDocs()
  @Roles('admin')
  @Patch(':userId/role')
  async setUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserRoleDto,
    @Request() req,
  ) {
    return this.adminService.setUserRole(
      userId,
      dto,
      req.user.id,
      req.requestId,
    );
  }

  @AdminDeleteUserDocs()
  @Roles('admin')
  @Delete(':userId')
  async deleteuser(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.adminService.deleteUser(userId, req.user.id, req.requestId);
  }
}
