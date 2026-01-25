import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class PasswordResetDto implements Readonly<PasswordResetDto> {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;
}
