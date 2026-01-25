import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import BaseException from '../../utils/exceptions/base.exception';
import { getRepository } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/enum/user-role.enum';
import { FirebaseUser } from '../../entities/firebase.user.entity';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-access-token'] || '';
    if (!token) {
      throw new BaseException('401au01');
    }

    let user: FirebaseUser;
    try {
      if (token) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        user = await getRepository(FirebaseUser).findOne({
          where: {
            firebaseId: decodedToken.user_id,
            isDeleted: false,
          },
        });
      } else {
        user = await getRepository(FirebaseUser).findOne({
          where: {
            isDeleted: false,
          },
        });
      }
    } catch (err) {
      console.log(err);
      throw new BaseException('401au01');
    }

    if (!user) {
      console.log('No user found');
      throw new BaseException('401au01');
    }

    const requireVerifiedEmail = this.getMetadata<boolean>(
      context,
      'requireVerifiedEmail',
      true,
    );
    if (requireVerifiedEmail && !user?.isEmailVerified) {
      throw new BaseException('401au02');
    }

    const requireAdminRole = this.getMetadata<boolean>(
      context,
      'requireAdminRole',
      false,
    );
    if (requireAdminRole && user.role !== UserRole.ADMIN) {
      throw new BaseException('403au00');
    }

    req.user = user;
    return true;
  }

  private getMetadata<T>(
    context: ExecutionContext,
    key: string,
    defaultValue: T,
  ): T {
    return this.reflector.get<T>(key, context.getHandler()) ?? defaultValue;
  }
}
