import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { WorkEntrySession } from './work-entry-session.entity';
import { WorkSessionMediaPhase } from './enum/work-session-media-phase.enum';

@Entity()
@Index(['sessionId'])
export class WorkSessionMedia extends BaseEntity {
  @Column('uuid', { nullable: false })
  sessionId: string;

  @Column('varchar', { nullable: false, length: 512 })
  filePath: string;

  @Column('enum', {
    enum: WorkSessionMediaPhase,
    nullable: false,
    default: WorkSessionMediaPhase.START,
  })
  phase: WorkSessionMediaPhase;

  @JoinColumn({ name: 'sessionId' })
  @ManyToOne(() => WorkEntrySession, (session) => session.media)
  session: WorkEntrySession;
}
