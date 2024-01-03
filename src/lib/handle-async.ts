import type { RequestHandler } from 'express';
import { type Schema } from 'zod';

import { type ValidationError, ValidationException } from '$/exceptions';

import { checkAuth } from './check-auth';
import { parseSchema } from './parse-schema';

const handleAsync = <TBody = unknown, TQuery = unknown, TParams = unknown>(
  fn: RequestHandler<TParams, any, TBody, TQuery>,
  settings?: {
    schema?: {
      body?: Schema<TBody>;
      query?: Schema<TQuery>;
      params?: Schema<TParams>;
    };
    auth?: boolean | 'verified';
  },
): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (settings?.auth) {
        await checkAuth(req, settings.auth === 'verified');
      }

      if (settings?.schema) {
        let errors: ValidationError[] = [];
        for (const [key, keySchema] of Object.entries(settings.schema)) {
          // eslint-disable-next-line security/detect-object-injection
          const result = parseSchema((req as any)[key], keySchema);

          if (!result.success) {
            errors = [...errors, ...result.errors];
          } else {
            // eslint-disable-next-line security/detect-object-injection
            (req as any)[key] = result.data;
          }
        }
        if (errors.length > 0) {
          throw new ValidationException(errors);
        }
      }
      await Promise.resolve(fn(req as any, res, next));
    } catch (error) {
      next(error);
    }
  };
};

export { handleAsync };
