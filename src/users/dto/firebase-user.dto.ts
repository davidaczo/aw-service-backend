import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FirebaseUserDto {
  @IsUUID()
  id: string;

  @IsString()
  firebaseId: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsBoolean()
  isEmailVerified: boolean;

  @IsString()
  @IsOptional()
  photoUrl?: string;
}
