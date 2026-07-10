import { NextFunction, RequestHandler, Response } from 'express';

export type AsyncRequestHandler<TRequest> = (
  req: TRequest,
  res: Response,
  next: NextFunction
) => void | Promise<unknown>;

export const asyncHandler =
  <TRequest>(fn: AsyncRequestHandler<TRequest>): RequestHandler =>
  (req, res, next): void => {
    void Promise.resolve(fn(req as unknown as TRequest, res, next)).catch(next);
  };
