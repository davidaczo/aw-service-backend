import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseAuthController } from './firebase-auth.controller';
import { UsersModule } from '../users/users.module';
import { OtpCode } from '../entities/OTP-codes.entity';
import { FirebaseUser } from '../entities/firebase.user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FirebaseUser, OtpCode]), UsersModule],
  controllers: [FirebaseAuthController],
  providers: [FirebaseAuthService],
  exports: [FirebaseAuthService],
})
export class FirebaseAuthModule {}
