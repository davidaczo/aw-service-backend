import { Entity, Index, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from '../users/enum/user-role.enum';

@Entity()
@Index(['id'])
export class User extends BaseEntity {
  @Column('varchar', { nullable: true, length: 320 })
  email: string;

  @Column('varchar', { nullable: true, length: 256 })
  password: string;

  @Column('varchar', { nullable: true, length: 32 })
  firstName: string;

  @Column('varchar', { nullable: true, length: 32 })
  lastName: string;

  @Column('text', { nullable: false })
  searchValue: string;

  @Column('varchar', { nullable: true, length: 128 })
  passwordResetToken: string;

  @Column('enum', {
    nullable: false,
    name: 'role',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column('boolean', { nullable: false, default: false })
  secondFactorEnabled: boolean;

  @Column('varchar', { nullable: true, length: 32 })
  secondFactorSecret: string;
}
