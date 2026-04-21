import { IsOptional, IsString } from 'class-validator';

export class PauseWorkEntryDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
