export class TokenPayloadDto implements Readonly<TokenPayloadDto> {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: number;
  refreshTokenExpiration: number;
}
