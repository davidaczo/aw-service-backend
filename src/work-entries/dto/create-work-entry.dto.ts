import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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

  @IsOptional()
  @IsString()
  assignedUserId?: string;
}
