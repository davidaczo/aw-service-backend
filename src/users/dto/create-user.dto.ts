import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto implements Readonly<CreateUserDto> {
  @IsEmail()
  @MinLength(3)
  @MaxLength(320)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @IsOptional()
  password: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  firstName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  lastName: string;

  constructor(data) {
    if (data) {
      this.email = data.email;
      this.password = data.password;
      if (data.firstName) {
        this.firstName = data.firstName;
      }
      if (data.lastName) {
        this.lastName = data.lastName;
      }
    }
  }
}
