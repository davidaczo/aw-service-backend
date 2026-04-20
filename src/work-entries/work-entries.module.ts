import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkEntry } from '../entities/work-entry.entity';
import { WorkEntrySession } from '../entities/work-entry-session.entity';
import { WorkEntriesService } from './work-entries.service';
import { WorkEntriesController } from './work-entries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkEntry, WorkEntrySession])],
  controllers: [WorkEntriesController],
  providers: [WorkEntriesService],
  exports: [WorkEntriesService],
})
export class WorkEntriesModule {}
