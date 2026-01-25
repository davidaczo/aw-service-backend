import { UserMinDto } from './user-min.dto';
import { configService } from '../../config/config.service';
import { User } from '../../entities/user.entity';
import { FirebaseUser } from '../../entities/firebase.user.entity';

export class UserDetailedDto
  extends UserMinDto
  implements Readonly<UserDetailedDto>
{
  email: string;
  isEmailVerified?: boolean;
  name: string;
  socketToken: string;
  apiVersion: string;
  secondFactorEnabled: boolean;

  constructor(data: any) {
    if (data) {
      super(data);
      this.email = data.email;
      this.socketToken = configService.getSocketToken();
      this.apiVersion = configService.getApiVersion();
      if (data instanceof User) {
        this.name = `${data.firstName} ${data.lastName}`;
        this.secondFactorEnabled = data.secondFactorEnabled;
      }
      if (data instanceof FirebaseUser) {
        this.isEmailVerified = data.isEmailVerified;
        this.firstName = data.name.split(' ')?.[0] || '';
        this.lastName = data.name.split(' ')?.[1] || '';
        this.name = data.name;
      }
    }
  }
}
