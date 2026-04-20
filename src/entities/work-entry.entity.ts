import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { FirebaseUser } from './firebase.user.entity';
import { WorkEntryStatus } from './enum/work-entry-status.enum';
import { WorkEntrySession } from './work-entry-session.entity';

@Entity()
@Index(['userId'])
@Index(['userId', 'createdAt'])
export class WorkEntry extends BaseEntity {
  @Column('uuid')
  userId: string;

  @ManyToOne(() => FirebaseUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: FirebaseUser;

  @Column('varchar', { length: 255 })
  categoryId: string;

  @Column('varchar', { length: 255 })
  subcategoryId: string;

  @Column('varchar', { length: 255 })
  clientName: string;

  @Column('varchar', { length: 255 })
  machineName: string;

  @Column('varchar', { length: 255 })
  machineModel: string;

  @Column('int')
  manufacturingYear: number;

  @Column('varchar', { length: 255 })
  serialNumber: string;

  @Column('int')
  operatingHours: number;

  @Column('decimal', { precision: 10, scale: 2 })
  hectares: number;

  @Column({
    type: 'enum',
    enum: WorkEntryStatus,
    default: WorkEntryStatus.TODO,
    nullable: false,
  })
  status: WorkEntryStatus;

  @OneToMany(() => WorkEntrySession, (session) => session.workEntry)
  sessions: WorkEntrySession[];
}
