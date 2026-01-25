import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@Entity()
@Index(['id'])
export class Session extends BaseEntity {
  @Column('timestamptz', { nullable: false })
  accessTokenExpiration: Date;

  @Column('timestamptz', { nullable: false })
  refreshTokenExpiration: Date;

  @Column('timestamptz', {
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastUsed: Date;

  @Column('int4', { nullable: false, default: 1 })
  version: number;

  @Column('boolean', { nullable: false, default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  operatingSystem: string;

  @Column('text', { nullable: true })
  browser: string;

  @Column('text', { nullable: true })
  ipAddress: string;

  @Column('text', { nullable: true })
  country: string;

  @Column('text', { nullable: true })
  city: string;

  @JoinColumn()
  @ManyToOne(() => User, ({ id }) => id, {
    nullable: false,
    eager: true,
  })
  user: User;
}
