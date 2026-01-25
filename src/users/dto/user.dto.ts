import { UserMinDto } from './user-min.dto';
import { User } from '../../entities/user.entity';

export class UserDto extends UserMinDto implements Readonly<UserDto> {
  email: string;
  passwordResetToken: string;

  constructor(data: Partial<User>) {
    if (data) {
      super(data);
      if (data.email) {
        this.email = data.email;
      }
      if (data.passwordResetToken) {
        this.passwordResetToken = data.passwordResetToken;
      }
    }
  }
}
