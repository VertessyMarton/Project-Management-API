import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AddMemberDto } from './dto/add-member.dto';
import { ProjectRolesGuard } from 'src/common/guards/project-roles.guard';
import { ProjectRoles } from 'src/common/decorators/project-roles.decorator';
import {
  AddProjectMemberDocs,
  CreateProjectDocs,
  GetAllProjectDocs,
  GetProjectDocs,
  RemoveProjectDocs,
  UpdateProjectDocs,
} from 'src/common/decorators/swagger/project-docs.decorator';

@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @CreateProjectDocs()
  @Post()
  async createProject(@Request() req, @Body() dto: CreateProjectDto) {
    return await this.projectService.createProject(req.user.id, dto);
  }

  @GetProjectDocs()
  @Get(':projectId')
  async getProject(@Request() req, @Param('projectId') id: number) {
    return await this.projectService.getPrtoject(id, req.user.id);
  }

  @GetAllProjectDocs()
  @Get()
  async getAllProject(@Request() req) {
    return await this.projectService.getAllProject(req.user.id);
  }

  @RemoveProjectDocs()
  @Delete(':projectId')
  async removeProject(@Param('projectId') id: number, @Request() req) {
    return await this.projectService.removeProject(id, req.user.id);
  }

  @UpdateProjectDocs()
  @Patch(':projectId')
  async updateProject(
    @Request() req,
    @Param('projectId') id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return await this.projectService.updateProject(id, req.user.id, dto);
  }

  @AddProjectMemberDocs()
  @ProjectRoles(['owner'])
  @Post(':projectId')
  async addProjectMember(
    @Param('projectId') id: number,
    @Body() dto: AddMemberDto,
  ) {
    return await this.projectService.addProjectMember(id, dto);
  }
}
