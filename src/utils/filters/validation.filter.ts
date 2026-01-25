import { ExceptionFilter, ArgumentsHost, Catch } from '@nestjs/common';
import { configService } from 'src/config/config.service';
import { ValidationException } from '../exceptions/validation.exception';
import { customErrors as errorCodes } from '../error';

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost): any {
    const response = host.switchToHttp().getResponse();

    if (configService.isProductionBuild()) {
      return response.status(406).json({
        statusCode: 406,
        code: errorCodes['406vd00'].code,
        description: errorCodes['406vd00'].name,
      });
    }

    return response.status(406).json({
      code: errorCodes['406vd00'].code,
      description: errorCodes['406vd00'].name,
      errors: this.parseErrors(exception.validationErrors),
    });
  }

  parseErrors = (errors) => {
    if (!Array.isArray(errors) || !errors.length) return undefined;
    return errors.map((error) => {
      return {
        property: error.property,
        value: !Array.isArray(error.children) ? error.value : undefined,
        violated: error.constraints,
        children: Array.isArray(error.children)
          ? this.parseErrors(error.children)
          : undefined,
      };
    });
  };
}
