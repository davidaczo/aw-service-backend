import { TokenPayloadDto } from '../../dto/token-payload.dto';
import { UserDetailedDto } from '../../users/dto/user-detailed.dto';

export class TokenPayloadWithUserDto
  extends TokenPayloadDto
  implements Readonly<TokenPayloadDto>
{
  user: UserDetailedDto;
}
