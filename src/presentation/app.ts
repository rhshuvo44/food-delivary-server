import cookieParser from 'cookie-parser';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import { corsOptions } from '../config/cors';
import { errorHandler } from '../middlewares/errorHandler';
import { notFoundHandler } from '../middlewares/notFoundHandler';
import { requestLogger } from '../middlewares/requestLogger';
import router from '../routes';

export const app: Application = express();

app.use(helmet());
app.use(requestLogger);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cookieParser());
app.use(corsOptions);

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Food Order Management System Server is running', data: { status: 'healthy' }, statusCode: 200 });
});

app.use('/api/v1', router);
app.use(notFoundHandler);
app.use(errorHandler);

