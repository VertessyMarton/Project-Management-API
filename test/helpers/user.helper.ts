export const createUserDto = () => {
  const id = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

  return {
    name: `user${id}`,
    email: `user${id}@gmail.com`,
    password: 'Password123!',
  };
};
