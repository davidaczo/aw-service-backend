import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMeDto implements Readonly<UpdateMeDto> {
  @IsEmail()
  @MinLength(3)
  @MaxLength(320)
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  firstName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  lastName: string;
}
