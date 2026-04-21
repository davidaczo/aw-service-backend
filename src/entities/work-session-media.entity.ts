import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { WorkEntrySession } from './work-entry-session.entity';

@Entity()
@Index(['sessionId'])
export class WorkSessionMedia extends BaseEntity {
  @Column('uuid', { nullable: false })
  sessionId: string;

  @Column('varchar', { nullable: false, length: 512 })
  filePath: string;

  @JoinColumn({ name: 'sessionId' })
  @ManyToOne(() => WorkEntrySession, (session) => session.media)
  session: WorkEntrySession;
}
