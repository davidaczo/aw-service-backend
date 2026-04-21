import { IsOptional, IsString } from 'class-validator';

export class StopWorkEntryDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
