export class UserTokenDto {
  id: string;
  deviceId: string;
  deviceType: string;
  deviceName: string;
  lastUsedAt: Date;
}

export class UserTokensResponseDto {
  tokens: UserTokenDto[];
}
