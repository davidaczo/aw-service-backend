import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import BaseException from '../../utils/exceptions/base.exception';
import * as jwt from 'jsonwebtoken';
import { configService } from '../../config/config.service';
import { getRepository } from 'typeorm';
import { Session } from '../../entities/session.entity';
import { validateAuthToken } from '../../utils/utils';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-access-token'];
    if (!token) {
      throw new BaseException('401au01');
    }

    try {
      const tokenData = jwt.verify(token, configService.getJwtSecret());
      const session = await validateAuthToken(
        (tokenData as any).data,
        'ACCESS',
      );
      request.session = session;
      const { id, user, lastUsed } = session;
      request.accessToken = token;
      request.user = user;

      const d = new Date().getTime();
      const l = lastUsed.getTime();
      if (d - l > 300000) {
        await getRepository(Session).update({ id }, { lastUsed: new Date(d) });
      }
      return true;
    } catch (error) {
      throw new BaseException('401au01');
    }
  }
}
