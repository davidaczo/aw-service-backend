import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { WorkEntry } from './work-entry.entity';
import { FirebaseUser } from './firebase.user.entity';

export enum WorkEntrySessionStatus {
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

@Entity()
@Index(['workEntryId'])
@Index(['userId'])
@Index(['workEntryId', 'status'])
export class WorkEntrySession extends BaseEntity {
  @Column('uuid', { nullable: false })
  workEntryId: string;

  @Column('uuid', { nullable: false })
  userId: string;

  @Column('enum', {
    nullable: false,
    enum: WorkEntrySessionStatus,
    default: WorkEntrySessionStatus.STARTED,
  })
  status: WorkEntrySessionStatus;

  @Column('timestamptz', { nullable: true })
  startedAt: Date | null;

  @Column('timestamptz', { nullable: true })
  pausedAt: Date | null;

  @Column('timestamptz', { nullable: true })
  stoppedAt: Date | null;

  @JoinColumn({ name: 'workEntryId' })
  @ManyToOne(() => WorkEntry, (entry) => entry.sessions)
  workEntry: WorkEntry;

  @JoinColumn({ name: 'userId' })
  @ManyToOne(() => FirebaseUser)
  user: FirebaseUser;
}
