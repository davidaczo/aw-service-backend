import { IsNotEmpty, IsString } from 'class-validator';

export class CheckEmailDto implements Readonly<CheckEmailDto> {
  @IsString()
  @IsNotEmpty()
  email: string;
}
