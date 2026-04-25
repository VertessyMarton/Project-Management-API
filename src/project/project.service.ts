import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { ProjectMembers } from './entities/project-members.entity';
import { ProjectRoleEnum } from './enums/project-role.enum';
import { User } from 'src/user/entities/user.entity';
import { addMemberDto } from './dto/add-member.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(ProjectMembers)
    private projectMemberRepository: Repository<ProjectMembers>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createProject(userId: number, dto: CreateProjectDto) {
    const project = await this.projectRepository.save({
      name: dto.name,
      description: dto.description,
      user: { id: userId },
    });

    await this.projectMemberRepository.save({
      project: { id: project.id },
      user: { id: userId },
      role: ProjectRoleEnum.OWNER,
    });

    return project;
  }

  async getPrtoject(id: number, userId: number) {
    const project = await this.projectRepository.findOne({
      where: {
        id: id,
        user: { id: userId },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async getAllProject(userId: number) {
    const projects = await this.projectRepository.find({
      where: {
        user: { id: userId },
      },
    });
    return projects;
  }

  async removeProject(id: number, userId: number) {
    const project = await this.projectRepository.delete({
      id,
      user: { id: userId },
    });

    if (project.affected === 0) {
      throw new NotFoundException('Project not found');
    }
    return { message: 'Project deleted' };
  }

  async updateProject(id: number, userId: number, dto: UpdateProjectDto) {
    const updateData: Partial<Pick<Project, 'name' | 'description'>> = {};

    if ('name' in dto) {
      updateData.name = dto.name;
    }

    if ('description' in dto) {
      updateData.description = dto.description;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'At least one of name or description must be provided.',
      );
    }

    const project = await this.projectRepository.update(
      { id: id, user: { id: userId } },
      updateData,
    );

    if (project.affected === 0) {
      throw new NotFoundException('Project not found');
    }

    return await this.projectRepository.findOne({
      where: { id: id },
    });
  }

  async addProjectMember(projectId: number, dto: addMemberDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User cannot be added to project');
    }

    const hasRole = await this.projectMemberRepository.findOne({
      where: {
        project: { id: projectId },
        user: { id: user.id },
      },
    });

    if (hasRole) {
      throw new ForbiddenException('Cannot add user to the project');
    }

    return await this.projectMemberRepository.save({
      project: { id: projectId },
      user: { id: user.id },
      role: dto.role,
    });
  }
}
