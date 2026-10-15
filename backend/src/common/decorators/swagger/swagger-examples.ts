export const userExample = {
  id: 1,
  name: 'Test User',
  email: 'testemail@example.com',
  role: 'user',
  status: 'verified',
  createdAt: '2026-04-25T10:30:00.000Z',
  updatedAt: '2026-04-25T10:30:00.000Z',
};

export const projectExample = {
  id: 1,
  name: 'Website redesign',
  description: 'Refresh landing page and dashboard flows',
  createdAt: '2026-04-25T10:30:00.000Z',
  updatedAt: '2026-04-25T10:30:00.000Z',
};

export const projectMemberExample = {
  id: 1,
  role: 'member',
};

export const taskExample = {
  id: 1,
  title: 'Prepare release notes',
  description: 'Summarize completed project work',
  status: 'todo',
  dueDate: '2026-05-01T10:30:00.000Z',
  createdById: 1,
  assigneeId: 2,
  projectId: 1,
  createdAt: '2026-04-25T10:30:00.000Z',
  updatedAt: '2026-04-25T10:30:00.000Z',
};

export const commentExample = {
  id: 1,
  content: 'Looks ready to ship.',
  authorId: 1,
  taskId: 1,
  createdAt: '2026-04-25T10:30:00.000Z',
  updatedAt: '2026-04-25T10:30:00.000Z',
};

export const adminTaskExample = {
  id: 1,
  title: 'Prepare release notes',
  status: 'todo',
  dueDate: '2026-05-01T10:30:00.000Z',
  project: {
    id: 1,
    name: 'Website redesign',
  },
  assignee: {
    id: 2,
    name: 'Task Assignee',
    email: 'assignee@example.com',
  },
  createdBy: {
    id: 1,
    name: 'Test User',
  },
};

export const adminCommentExample = {
  id: 1,
  content: 'Looks ready to ship.',
  createdAt: '2026-04-25T10:30:00.000Z',
  updatedAt: '2026-04-25T10:30:00.000Z',
  author: {
    id: 1,
    name: 'Test User',
    email: 'testemail@example.com',
  },
  task: {
    id: 1,
    title: 'Prepare release notes',
  },
  project: {
    id: 1,
    name: 'Website redesign',
  },
};

export function paginatedExample(data: unknown[], limit = 25) {
  return {
    data,
    meta: {
      page: 1,
      limit,
      total: data.length,
      totalPages: data.length === 0 ? 0 : 1,
    },
  };
}
