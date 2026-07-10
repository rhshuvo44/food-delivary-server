import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { config } from '../config/environment';
import { errorResponse } from '../utils/apiResponse';
import { AppError, InternalServerError } from '../utils/errors';

export const errorHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((error) => ({
      path: error.path.join('.'),
      message: error.message,
    }));

    res.status(422).json(errorResponse('Validation Error', JSON.stringify(formattedErrors), 422));
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message, undefined, err.statusCode));
    return;
  }

  const internalError = new InternalServerError();
  const errorData = errorResponse(
    internalError.message,
    config.NODE_ENV === 'development' ? err.message : undefined,
    internalError.statusCode
  );

  res.status(internalError.statusCode).json(errorData);
};
