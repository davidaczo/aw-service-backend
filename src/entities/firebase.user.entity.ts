import { Entity, Index, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from '../users/enum/user-role.enum';

@Entity()
@Index(['id'])
export class FirebaseUser extends BaseEntity {
  @Column('text', { nullable: true })
  firebaseId: string;

  @Column('varchar', { nullable: true, length: 320 })
  email: string;

  @Column('text', { nullable: true })
  name: string;

  @Column('enum', {
    nullable: false,
    name: 'role',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column('boolean', { nullable: false, default: false })
  isEmailVerified: boolean;
}
