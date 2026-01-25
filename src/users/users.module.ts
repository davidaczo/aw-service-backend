import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { FirebaseModule } from '../firebase/firebase.module';
import { FirebaseUser } from '../entities/firebase.user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, FirebaseUser]), FirebaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
