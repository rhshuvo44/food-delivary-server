
import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

export const validateRequest =
    (schema: ZodSchema) => async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const validated = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });

            req.body = validated.body ?? req.body;
            req.query = validated.query ?? req.query;
            req.params = validated.params ?? req.params;

            next();
        } catch (error) {
            next(new ValidationError('Request validation failed'));
        }
    };
