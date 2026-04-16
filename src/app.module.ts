import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { SocketModule } from './socket.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { FirebaseAuthModule } from './firebase-auth/firebase-auth.module';
import { FirebaseModule } from './firebase/firebase.module';
import { NotificationModule } from './notifications/notifications.module';
import { WorkEntriesModule } from './work-entries/work-entries.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([User]),
    ScheduleModule.forRoot(),
    SocketModule,
    UsersModule,
    FirebaseModule,
    FirebaseAuthModule,
    NotificationModule,
    WorkEntriesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
