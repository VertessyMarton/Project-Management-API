import type { ProjectQueryDto } from './dto/project-query.dto';
import { ProjectRoleEnum } from './enums/project-role.enum';
import { ProjectController } from './project.controller';

describe('ProjectController', () => {
  let controller: ProjectController;
  let projectService: {
    createProject: jest.Mock;
    getProject: jest.Mock;
    getAllProject: jest.Mock;
    removeProject: jest.Mock;
    updateProject: jest.Mock;
    addProjectMember: jest.Mock;
  };

  beforeEach(() => {
    projectService = {
      createProject: jest.fn(),
      getProject: jest.fn(),
      getAllProject: jest.fn(),
      removeProject: jest.fn(),
      updateProject: jest.fn(),
      addProjectMember: jest.fn(),
    };

    controller = new ProjectController(projectService as any);
  });

  it('creates a project for the request user', async () => {
    const dto = { name: 'Roadmap', description: 'Q2' };
    const project = { id: 10, ...dto };
    projectService.createProject.mockResolvedValue(project);

    await expect(
      controller.createProject({ user: { id: 1 } }, dto),
    ).resolves.toBe(project);
    expect(projectService.createProject).toHaveBeenCalledWith(1, dto);
  });

  it('lists only projects for the request user', async () => {
    const projects = [{ id: 10 }];
    const query = {} as ProjectQueryDto;
    projectService.getAllProject.mockResolvedValue(projects);

    await expect(
      controller.getAllProject({ user: { id: 1 } }, query),
    ).resolves.toBe(projects);
    expect(projectService.getAllProject).toHaveBeenCalledWith(1, query);
  });

  it('adds a member to the selected project', async () => {
    const dto = {
      email: 'member@example.com',
      role: ProjectRoleEnum.MEMBER,
    };
    const member = { id: 99, role: ProjectRoleEnum.MEMBER };
    projectService.addProjectMember.mockResolvedValue(member);

    await expect(controller.addProjectMember(10, dto)).resolves.toBe(member);
    expect(projectService.addProjectMember).toHaveBeenCalledWith(10, dto);
  });
});
