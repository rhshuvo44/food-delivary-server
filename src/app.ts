import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rootRouter from './routes';
import { globalErrorHandler, AppError } from './utils/shared';

const app: Application = express();

// Security and Essential Global Middlewares
app.use(helmet());
app.use(cors({ origin: '*' })); // Custom restrict for production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core v1 REST Gateway Api Endpoint
app.use('/api/v1', rootRouter);

// 404 Route Not Found Interception Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Central Exception Framework Engine
app.use(globalErrorHandler);

export default app;