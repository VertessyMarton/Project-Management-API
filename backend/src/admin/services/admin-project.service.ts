import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Project } from 'src/project/entities/project.entity';
import { AdminProjectQueryDto } from '../dto/admin.project-query.dto';
import { getExclusiveUpperDate } from '../utils/date-range.util';

@Injectable()
export class AdminProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAllProject(
    query: AdminProjectQueryDto = new AdminProjectQueryDto(),
  ) {
    const normalizedQuery = Object.assign(new AdminProjectQueryDto(), query);

    const {
      page,
      limit,
      q,
      memberId,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    } = normalizedQuery;

    const qb = this.projectRepository.createQueryBuilder('project');

    const term = q?.trim();

    if (term) {
      qb.andWhere(
        new Brackets((searchQb) => {
          searchQb
            .where('project.name ILIKE :term', {
              term: `%${term}%`,
            })
            .orWhere('project.description ILIKE :term', {
              term: `%${term}%`,
            });
        }),
      );
    }

    if (memberId !== undefined) {
      qb.innerJoin(
        'project.projectMembers',
        'member',
        'member.userId = :memberId',
        { memberId },
      );
    }

    if (createdFrom) {
      qb.andWhere('project.createdAt >= :createdFrom', {
        createdFrom: new Date(createdFrom),
      });
    }

    if (createdTo) {
      const createdToExclusive = getExclusiveUpperDate(createdTo);

      qb.andWhere('project.createdAt < :createdTo', {
        createdTo: createdToExclusive,
      });
    }

    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    qb.orderBy(`project.${sortBy}`, direction)
      .addOrderBy('project.id', direction)
      .skip((page - 1) * limit)
      .take(limit);

    const [projects, total] = await qb.getManyAndCount();

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

  async findOneProject(projectId: number) {
    const projects = await this.projectRepository.findOne({
      where: { id: projectId },
    });
    if (!projects) {
      throw new NotFoundException('Project not found');
    }
    return projects;
  }

  async deleteProject(projectId: number) {
    const project = await this.projectRepository.delete(projectId);
    if (project.affected === 0) {
      throw new NotFoundException('Project not found');
    }
    return { message: 'Project deleted' };
  }
}
