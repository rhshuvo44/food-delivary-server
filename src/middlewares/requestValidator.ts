import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

type ValidatedPart<
  TSchema extends z.ZodTypeAny,
  TKey extends 'body' | 'params' | 'query',
> = z.infer<TSchema> extends Record<TKey, infer TValue> ? TValue : undefined;

export type ValidatedRequest<TSchema extends z.ZodTypeAny> = Omit<
  Request,
  'body' | 'params' | 'query'
> & {
  body: ValidatedPart<TSchema, 'body'>;
  params: ValidatedPart<TSchema, 'params'>;
  query: ValidatedPart<TSchema, 'query'>;
};

export const validateRequest =
  (schema: z.ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    void schema
      .safeParseAsync({
        body: req.body as unknown,
        query: req.query as unknown,
        params: req.params as unknown,
      })
      .then((result) => {
        if (!result.success) {
          next(new ValidationError('Request validation failed'));
          return;
        }

        const validated = result.data as Record<string, unknown>;
        req.body = validated.body ?? (req.body as unknown);
        req.query = (validated.query ?? (req.query as unknown)) as never;
        req.params = (validated.params ?? (req.params as unknown)) as never;
        next();
      })
      .catch((error: unknown) => next(error));
  };
