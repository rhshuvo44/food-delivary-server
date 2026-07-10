import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ValidatedRequest } from '../../middlewares/requestValidator';
import { ForbiddenError, UnauthorizedError } from '../../utils/errors';
import { config } from '../../config/environment';
import prisma from '../../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

export type AuthenticatedValidatedRequest<TSchema extends z.ZodTypeAny> = ValidatedRequest<TSchema> &
  Pick<AuthenticatedRequest, 'user'>;

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    return next(new UnauthorizedError('Authentication required'));
  }

  let payload: jwt.JwtPayload;
  try {
    const verifiedToken = jwt.verify(token, config.JWT_SECRET);
    if (typeof verifiedToken === 'string' || typeof verifiedToken.sub !== 'string') {
      throw new UnauthorizedError('Invalid or expired access token');
    }
    payload = verifiedToken;
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
    return;
  }

  void prisma.user
    .findUnique({ where: { id: payload.sub } })
    .then((user) => {
      if (!user) {
        next(new UnauthorizedError('User not found'));
        return;
      }

      req.user = { id: user.id, role: user.role, email: user.email };
      next();
    })
    .catch(() => next(new UnauthorizedError('Invalid or expired access token')));
};

export const authorize =
  (roles: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      next(new ForbiddenError('Access denied'));
      return;
    }

    next();
  };
