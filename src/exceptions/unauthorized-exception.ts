import httpStatus from 'http-status';

import type { HttpExceptionOptions } from './http.exception';
import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(
    response: string | Record<string, any> = 'Unauthorized',
    options?: HttpExceptionOptions,
  ) {
    super(httpStatus.UNAUTHORIZED, response, options);
  }
}
