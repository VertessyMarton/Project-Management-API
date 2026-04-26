import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  AdminDeleteProjectDocs,
  AdminFindAllProjectDocs,
  AdminFindOneProjectDocs,
} from 'src/common/decorators/swagger/admin-project-docs.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminProjectController {
  constructor(private readonly adminService: AdminService) {}

  @AdminFindAllProjectDocs()
  @Roles('admin')
  @Get('projects')
  async findAllProject() {
    return this.adminService.findAllProject();
  }

  @AdminFindOneProjectDocs()
  @Roles('admin')
  @Get('projects/:projectId')
  async findOneProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.adminService.findOneProject(projectId);
  }

  @AdminDeleteProjectDocs()
  @Roles('admin')
  @Delete('projects/:projectId')
  async deleteProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.adminService.deleteProject(projectId);
  }
}
