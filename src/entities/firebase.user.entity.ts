import { Entity, Index, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from '../users/enum/user-role.enum';
import { PushToken } from './push-tokens.entity';
import { OnboardingStep } from '../users/enum/onboarding-step';

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

  @Column('text', { nullable: true })
  photoUrl: string;

  @OneToMany(() => PushToken, (pushToken) => pushToken.user)
  pushTokens: PushToken[];

  @Column('enum', {
    nullable: true,
    name: 'OnboardingStep',
    enum: OnboardingStep,
    default: OnboardingStep.EMPTY,
  })
  onboardingStep: OnboardingStep;
}
