export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, new target.prototype);
  }
}

// Global Error Middleware
import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Production logging (Avoid logging sensitive data)
  console.error(`[ERROR] ${req.method} ${req.url} - `, err.message);

  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Something went wrong on our end' : message,
  });
};