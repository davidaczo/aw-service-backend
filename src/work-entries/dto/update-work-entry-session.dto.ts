import {IsOptional, IsString} from "class-validator";

export class UpdateWorkEntrySessionDto {
  @IsString()
  @IsOptional()
  startedAt?: string;
  @IsString()
  @IsOptional()
  pausedAt?: string;
  @IsString()
  @IsOptional()
  stoppedAt?: string;
}
