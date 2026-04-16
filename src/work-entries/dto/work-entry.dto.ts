import { WorkEntry } from '../../entities/work-entry.entity';

export class WorkEntryDto {
  id: string;
  userId: string;
  categoryId: string;
  subcategoryId: string;
  clientName: string;
  machineName: string;
  machineModel: string;
  manufacturingYear: number;
  serialNumber: string;
  operatingHours: number;
  hectares: number;
  createdAt: string;
  updatedAt: string;
}

export const parseWorkEntryToDto = (entry: WorkEntry): WorkEntryDto => {
  const dto = new WorkEntryDto();
  dto.id = entry.id;
  dto.userId = entry.userId;
  dto.categoryId = entry.categoryId;
  dto.subcategoryId = entry.subcategoryId;
  dto.clientName = entry.clientName;
  dto.machineName = entry.machineName;
  dto.machineModel = entry.machineModel;
  dto.manufacturingYear = entry.manufacturingYear;
  dto.serialNumber = entry.serialNumber;
  dto.operatingHours = entry.operatingHours;
  dto.hectares = Number(entry.hectares);
  dto.createdAt = entry.createdAt.toISOString();
  dto.updatedAt = entry.lastChangedAt.toISOString();
  return dto;
};
