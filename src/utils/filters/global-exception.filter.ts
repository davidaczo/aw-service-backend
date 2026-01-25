import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { customErrors } from '../error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): any {
    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      ...GlobalExceptionFilter.parseError(exception, status),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private static parseError(
    error: { code: string | number } | any,
    status: number,
  ) {
    if (error?.code && customErrors[error.code]) {
      return {
        status: status,
        error: {
          ...customErrors[error.code],
        },
      };
    } else if (error?.name && customErrors[error.name]) {
      return {
        status: status,
        error: {
          ...customErrors[error.name],
          message: error.message
            ? error.message
            : `Error code not recognized: ${error.code}`,
        },
      };
    } else {
      return {
        status: status,
        error: {
          name: error.name ? error.name : `Unknown error`,
          message: error.message
            ? error.message
            : `Error code not recognized: ${error.code}`,
        },
      };
    }
  }
}
