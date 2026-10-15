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
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { ProjectMembers } from './entities/project-members.entity';
import { ProjectRoleEnum } from './enums/project-role.enum';
import { User } from 'src/user/entities/user.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';
import { ChangeMemberDto } from './dto/change-member.dto';
import { ProjectQueryDto } from './dto/project-query.dto';

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
    });

    await this.projectMemberRepository.save({
      projectId: project.id,
      userId,
      role: ProjectRoleEnum.OWNER,
    });

    return project;
  }

  async getProject(projectId: number) {
    const project = await this.projectRepository.findOne({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async getAllProject(
    userId: number,
    query: ProjectQueryDto = new ProjectQueryDto(),
  ) {
    const normalizedQuery = Object.assign(new ProjectQueryDto(), query);
    const { page, limit, name, sortBy, sortOrder } = normalizedQuery;

    const where: FindOptionsWhere<Project> = {
      projectMembers: {
        userId,
      },
    };

    if (name !== undefined) {
      where.name = ILike(`%${name.trim()}%`);
    }

    const [projects, total] = await this.projectRepository.findAndCount({
      where,
      order: {
        [sortBy]: sortOrder,
        id: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: projects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async removeProject(projectId: number) {
    const project = await this.projectRepository.delete({
      id: projectId,
    });

    if (project.affected === 0) {
      throw new NotFoundException('Project not found');
    }
    return { message: 'Project deleted' };
  }

  async updateProject(projectId: number, dto: UpdateProjectDto) {
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
      { id: projectId },
      updateData,
    );

    if (project.affected === 0) {
      throw new NotFoundException('Project not found');
    }

    return await this.projectRepository.findOne({
      where: { id: projectId },
    });
  }

  async addProjectMember(projectId: number, dto: AddMemberDto) {
    if (dto.role === ProjectRoleEnum.OWNER) {
      throw new ForbiddenException('Cannot add user as project owner');
    }

    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User cannot be added to project');
    }

    const hasRole = await this.projectMemberRepository.findOne({
      where: {
        projectId,
        userId: user.id,
      },
    });

    if (hasRole) {
      throw new ForbiddenException('Cannot add user to the project');
    }

    return await this.projectMemberRepository.save({
      projectId,
      userId: user.id,
      role: dto.role,
    });
  }

  async removeProjectMember(projectId: number, dto: RemoveMemberDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User cannot be removed from the project');
    }

    const hasRole = await this.projectMemberRepository.findOne({
      where: {
        projectId,
        userId: user.id,
      },
    });

    if (!hasRole) {
      throw new ForbiddenException('Cannot remove user from the project');
    }

    if (hasRole.role === ProjectRoleEnum.OWNER) {
      throw new ForbiddenException('Cannot remove user from the projects');
    }

    const deleted = await this.projectMemberRepository.delete({
      projectId,
      userId: user.id,
    });

    if (deleted.affected === 0) {
      throw new BadRequestException('User cannot be removed from the project');
    }

    return { message: 'User deleted from the project' };
  }

  async updateProjectMemberStatus(projectId: number, dto: ChangeMemberDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User is not a member of this project');
    }

    const hasRole = await this.projectMemberRepository.findOne({
      where: {
        projectId,
        userId: user.id,
      },
    });

    if (!hasRole) {
      throw new ForbiddenException('Cannot change member role');
    }
    if (
      dto.role === hasRole.role ||
      dto.role === ProjectRoleEnum.OWNER ||
      hasRole.role === ProjectRoleEnum.OWNER
    ) {
      throw new ForbiddenException('Cannot change member role');
    }

    await this.projectMemberRepository.update(
      { projectId, userId: user.id },
      { role: dto.role },
    );

    return {
      projectId,
      userId: user.id,
      role: dto.role,
    };
  }
}
