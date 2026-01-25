import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseAuthController } from './firebase-auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  controllers: [FirebaseAuthController],
  providers: [FirebaseAuthService],
  exports: [FirebaseAuthService],
})
export class FirebaseAuthModule {}
