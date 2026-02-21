import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { FirebaseUser } from './firebase.user.entity';

@Entity()
@Index(['userId'])
@Index(['token'])
@Index(['userId', 'deviceId'], { unique: true })
export class PushToken extends BaseEntity {
  @Column('varchar', { length: 255 })
  token: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => FirebaseUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: FirebaseUser;

  @Column('varchar', { length: 255, nullable: true })
  deviceId: string;

  @Column('varchar', { length: 50, nullable: true })
  deviceType: string;

  @Column('varchar', { length: 255, nullable: true })
  deviceName: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('timestamp', { nullable: true })
  lastUsedAt: Date;
}
