import httpStatus from 'http-status';

import { HttpException } from './http.exception';

export class NotFoundException extends HttpException {
  constructor() {
    super(httpStatus.NOT_FOUND, httpStatus[httpStatus.NOT_FOUND]);
  }
}
