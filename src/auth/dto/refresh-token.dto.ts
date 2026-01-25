import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto implements Readonly<RefreshTokenDto> {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
