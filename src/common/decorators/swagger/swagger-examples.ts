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
