import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { WorkEntry } from './work-entry.entity';
import { FirebaseUser } from './firebase.user.entity';

export enum WorkEntryAssignmentStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

@Entity()
@Index(['workEntryId'])
@Index(['assignedUserId'])
@Unique(['workEntryId', 'assignedUserId'])
export class WorkEntryAssignment extends BaseEntity {
  @Column('uuid')
  workEntryId: string;

  @ManyToOne(() => WorkEntry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workEntryId' })
  workEntry: WorkEntry;

  @Column('uuid')
  assignedUserId: string;

  @ManyToOne(() => FirebaseUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignedUserId' })
  assignedUser: FirebaseUser;

  @Column('uuid')
  assignedByUserId: string;

  @ManyToOne(() => FirebaseUser, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assignedByUserId' })
  assignedByUser: FirebaseUser;

  @Column('enum', {
    nullable: false,
    enum: WorkEntryAssignmentStatus,
    default: WorkEntryAssignmentStatus.PENDING,
  })
  status: WorkEntryAssignmentStatus;
}
