import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';
import { FirebaseUser } from './firebase.user.entity';

export enum NotificationType {
  DEFAULT = 'default',
  FOLLOW = 'follow',
}

@Entity()
@Index(['userId', 'createdAt'])
@Index(['userId'])
export class Notification extends BaseEntity {
  @Column('uuid')
  userId: string;

  @ManyToOne(() => FirebaseUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: FirebaseUser;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.DEFAULT,
  })
  notificationType: NotificationType;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('text')
  body: string;

  @Column('jsonb', { nullable: true })
  data: any;
}
