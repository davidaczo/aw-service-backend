import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity()
@Index(['id'])
export class TfaSession extends BaseEntity {
  @Column('timestamptz', { nullable: false })
  expiration: Date;

  @JoinColumn()
  @ManyToOne(() => User, ({ id }) => id, {
    nullable: false,
    eager: true,
  })
  user: User;
}
