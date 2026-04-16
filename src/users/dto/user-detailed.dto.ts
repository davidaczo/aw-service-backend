import { UserRole } from '../enum/user-role.enum';
import { OnboardingStep } from '../enum/onboarding-step';
import { FirebaseUser } from '../../entities/firebase.user.entity';

export class UserDetailedDto {
  id: string;
  firebaseId: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  photoUrl: string | null;
  onboardingStep: OnboardingStep;
  createdAt: Date;

  constructor(user: FirebaseUser) {
    this.id = user.id;
    this.firebaseId = user.firebaseId;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.isEmailVerified = user.isEmailVerified;
    this.photoUrl = user.photoUrl ?? null;
    this.onboardingStep = user.onboardingStep;
    this.createdAt = user.createdAt;
    return this;
  }
}
