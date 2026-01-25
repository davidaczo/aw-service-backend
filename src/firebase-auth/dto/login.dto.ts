import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto implements Readonly<LoginDto> {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsOptional()
  name: string;
}
