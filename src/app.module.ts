import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { SocketModule } from './socket.module';
import { UsersModule } from './users/users.module';
import { User } from './entities/user.entity';
import { FirebaseAuthModule } from './firebase-auth/firebase-auth.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TypeOrmModule.forFeature([User]),
    ScheduleModule.forRoot(),
    AuthModule,
    SocketModule,
    UsersModule,
    FirebaseModule,
    FirebaseAuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
