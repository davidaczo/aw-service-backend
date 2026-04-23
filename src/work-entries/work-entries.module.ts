import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkEntry } from '../entities/work-entry.entity';
import { WorkEntrySession } from '../entities/work-entry-session.entity';
import { WorkSessionMedia } from '../entities/work-session-media.entity';
import { WorkEntryAssignment } from '../entities/work-entry-assignment.entity';
import { FirebaseUser } from '../entities/firebase.user.entity';
import { WorkEntriesService } from './work-entries.service';
import { WorkEntriesController } from './work-entries.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkEntry,
      WorkEntrySession,
      WorkSessionMedia,
      WorkEntryAssignment,
      FirebaseUser,
    ]),
  ],
  controllers: [WorkEntriesController],
  providers: [WorkEntriesService],
  exports: [WorkEntriesService],
})
export class WorkEntriesModule {}
