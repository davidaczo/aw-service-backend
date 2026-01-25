import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import BaseException from '../../utils/exceptions/base.exception';
import { configService } from '../../config/config.service';
import { validateTfaToken } from '../../utils/utils';

@Injectable()
export class OtpGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.query.token;

    if (!token) {
      throw new BaseException('401au01');
    }

    let data: string;
    try {
      const tokenData = jwt.verify(token, configService.getJwtSecret());
      data = (tokenData as any).data;
    } catch (error) {
      switch (error.message) {
        case 'invalid signature':
          throw new BaseException('400otp00');
        case 'jwt expired':
          throw new BaseException('400otp01');
        default:
          throw new BaseException('400otp99');
      }
    }

    request.tfaSession = await validateTfaToken(data);
    return true;
  }
}
