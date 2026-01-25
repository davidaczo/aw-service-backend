import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(public validationErrors: any[]) {
    super('406', HttpStatus.NOT_ACCEPTABLE);
  }
}
