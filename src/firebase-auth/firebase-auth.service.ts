import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BaseException from '../utils/exceptions/base.exception';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { UserRole } from '../users/enum/user-role.enum';
import { CheckEmailDto } from './dto/check-email.dto';
import { CheckEmailResponseDto } from './dto/check-email-reponse.dto';
import { inTransaction } from '../utils/sql/transactions';
import { LoginResponseDto } from './dto/login-reponse.dto';
import { FirebaseUser } from '../entities/firebase.user.entity';

@Injectable()
export class FirebaseAuthService {
  constructor(
    @InjectRepository(User)
    private readonly firebaseUserRepo: Repository<FirebaseUser>,
  ) {}

  async loginUser({ accessToken, name }: LoginDto): Promise<LoginResponseDto> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(accessToken);
      return await inTransaction(async (queryRunner) => {
        let user = await queryRunner.manager.findOne(FirebaseUser, {
          where: {
            firebaseId: decodedToken.user_id,
            isDeleted: false,
          },
        });
        let isNew = false;
        if (!user) {
          const mName = decodedToken.name ?? name.trim() ?? null;

          user = await queryRunner.manager.save(FirebaseUser, {
            firebaseId: decodedToken.user_id,
            email: decodedToken.email,
            name: mName,
            passwordResetToken: crypto.randomBytes(64).toString('hex'),
            role: UserRole.USER,
          });
          isNew = true;
        }
        return new LoginResponseDto(user, isNew);
      });
    } catch (error) {
      console.log(error);
      throw new BaseException('401au01');
    }
  }

  async isEmailRegistered({
    email,
  }: CheckEmailDto): Promise<CheckEmailResponseDto> {
    const user = await this.firebaseUserRepo.findOne({
      where: { email, isDeleted: false },
    });
    return new CheckEmailResponseDto(!!user);
  }
}
