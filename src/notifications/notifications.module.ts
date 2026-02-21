import { Module } from '@nestjs/common';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import { PushToken } from '../entities/push-tokens.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseUser } from '../entities/firebase.user.entity';
import { Notification } from '../entities/notifications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PushToken, FirebaseUser, Notification])],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
