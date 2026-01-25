import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class PasswordChangeDto implements Readonly<PasswordChangeDto> {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  newPassword: string;
}
