import { UserDetailedDto } from '../../users/dto/user-detailed.dto';
import { User } from '../../entities/user.entity';
import { FirebaseUser } from '../../entities/firebase.user.entity';

export class LoginResponseDto implements Readonly<LoginResponseDto> {
  user: UserDetailedDto;
  isNewUser: boolean;

  constructor(user: User | FirebaseUser, isNewUser: boolean) {
    this.user = new UserDetailedDto(user);
    this.isNewUser = isNewUser;
  }
}
