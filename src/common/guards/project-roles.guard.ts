import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRoles } from '../decorators/project-roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectMembers } from 'src/project/entities/project-members.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(ProjectMembers)
    private projectMemberRepository: Repository<ProjectMembers>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get(ProjectRoles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const projectId = Number(request.params.projectId);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      throw new BadRequestException(
        'Validation failed (numeric string is expected)',
      );
    }

    const membership = await this.projectMemberRepository.findOne({
      where: {
        user: { id: request.user.id },
        project: { id: request.params.projectId },
      },
    });

    if (!membership) {
      throw new NotFoundException('Resource not found');
    }

    return roles.includes(membership.role);
  }
}
