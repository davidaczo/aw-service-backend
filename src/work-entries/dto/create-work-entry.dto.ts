import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { WorkEntryPriority } from '../../entities/enum/work-entry-priority.enum';

export class CreateWorkEntryDto {
  @IsString()
  categoryId: string;

  @IsString()
  subcategoryId: string;

  @IsString()
  clientName: string;

  @IsString()
  machineName: string;

  @IsString()
  machineModel: string;

  @IsInt()
  @Min(1900)
  manufacturingYear: number;

  @IsString()
  serialNumber: string;

  @IsInt()
  @Min(0)
  operatingHours: number;

  @IsNumber()
  @Min(0)
  hectares: number;

  @IsEnum(WorkEntryPriority)
  @IsNotEmpty()
  priority: WorkEntryPriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedUserIds?: string[];
}
