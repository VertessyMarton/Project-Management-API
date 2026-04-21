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
import { addMemberDto } from './dto/add-member.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(@Request() req, @Body() dto: CreateProjectDto) {
    return await this.projectService.createProject(req.user.id, dto);
  }

  @Get(':projectId')
  async getProject(@Request() req, @Param('projectId') id: number) {
    return await this.projectService.getPrtoject(id, req.user.id);
  }

  @Get()
  async getAllProject(@Request() req) {
    return await this.projectService.getAllProject(req.user.id);
  }

  @Delete(':projectId')
  async removeProject(@Param('projectId') id: number, @Request() req) {
    return await this.projectService.removeProject(id, req.user.id);
  }

  @Patch(':projectId')
  async updateProject(
    @Request() req,
    @Param('projectId') id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return await this.projectService.updateProject(id, req.user.id, dto);
  }
}
