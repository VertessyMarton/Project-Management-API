import { Reflector } from '@nestjs/core';

export const ProjectRoles = Reflector.createDecorator<string[]>();
