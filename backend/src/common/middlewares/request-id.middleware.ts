import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

export type RequestWithId = Request & {
  requestId: string;
};

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = randomUUID();

  (req as RequestWithId).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
}
