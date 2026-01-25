import { IsString, MaxLength, MinLength } from 'class-validator';

export class OtpDto {
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  oneTimePassword: string;
}
