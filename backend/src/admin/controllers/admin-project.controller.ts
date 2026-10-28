import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  AdminDeleteProjectDocs,
  AdminFindAllProjectDocs,
  AdminFindOneProjectDocs,
} from 'src/common/decorators/swagger/admin-project-docs.decorator';
import { AdminProjectQueryDto } from '../dto/admin.project-query.dto';
import { AdminProjectService } from '../services/admin-project.service';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminProjectController {
  constructor(private readonly adminService: AdminProjectService) {}

  @AdminFindAllProjectDocs()
  @Roles('admin')
  @Get('projects')
  async findAllProject(@Query() query: AdminProjectQueryDto) {
    return this.adminService.findAllProject(query);
  }

  @AdminFindOneProjectDocs()
  @Roles('admin')
  @Get('projects/:projectId')
  async findOneProject(@Param('projectId', ParseIdPipe) projectId: number) {
    return this.adminService.findOneProject(projectId);
  }

  @AdminDeleteProjectDocs()
  @Roles('admin')
  @Delete('projects/:projectId')
  async deleteProject(
    @Param('projectId', ParseIdPipe) projectId: number,
    @Request() req,
  ) {
    return this.adminService.deleteProject(
      projectId,
      req.user.id,
      req.requestId,
    );
  }
}
