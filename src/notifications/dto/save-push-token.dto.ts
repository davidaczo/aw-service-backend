import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class SavePushTokenDto {
  @IsString()
  @IsNotEmpty()
  pushToken: string;

  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsOptional()
  @IsEnum(['ios', 'android'])
  deviceType?: 'ios' | 'android';

  @IsOptional()
  @IsString()
  deviceName?: string;
}
