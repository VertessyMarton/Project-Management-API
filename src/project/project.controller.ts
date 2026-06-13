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
  ParseIntPipe,
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
  RemoveProjectMemberDocs,
  UpdateProjectDocs,
} from 'src/common/decorators/swagger/project-docs.decorator';
import {
  MutationLimit,
  ReadLimit,
} from 'src/common/decorators/rate-limit.decorator';
import { RemoveMemberDto } from './dto/remove-member.dto';

@UseGuards(JwtAuthGuard, ProjectRolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @CreateProjectDocs()
  @MutationLimit()
  @Post()
  async createProject(@Request() req, @Body() dto: CreateProjectDto) {
    return await this.projectService.createProject(req.user.id, dto);
  }

  @GetProjectDocs()
  @ReadLimit()
  @ProjectRoles(['owner', 'member', 'viewer'])
  @Get(':projectId')
  async getProject(@Param('projectId', ParseIntPipe) id: number) {
    return await this.projectService.getProject(id);
  }

  @GetAllProjectDocs()
  @ReadLimit()
  @Get()
  async getAllProject(@Request() req) {
    return await this.projectService.getAllProject(req.user.id);
  }

  @RemoveProjectDocs()
  @MutationLimit()
  @ProjectRoles(['owner'])
  @Delete(':projectId')
  async removeProject(@Param('projectId', ParseIntPipe) id: number) {
    return await this.projectService.removeProject(id);
  }

  @UpdateProjectDocs()
  @MutationLimit()
  @ProjectRoles(['owner'])
  @Patch(':projectId')
  async updateProject(
    @Param('projectId', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return await this.projectService.updateProject(id, dto);
  }

  @AddProjectMemberDocs()
  @MutationLimit()
  @ProjectRoles(['owner'])
  @Post(':projectId')
  async addProjectMember(
    @Param('projectId', ParseIntPipe) id: number,
    @Body() dto: AddMemberDto,
  ) {
    return await this.projectService.addProjectMember(id, dto);
  }

  @RemoveProjectMemberDocs()
  @MutationLimit()
  @ProjectRoles(['owner'])
  @Delete(':projectId/members')
  async removeProjectMember(
    @Param('projectId', ParseIntPipe) id: number,
    @Body() dto: RemoveMemberDto,
  ) {
    return await this.projectService.removeProjectMember(id, dto);
  }
}
