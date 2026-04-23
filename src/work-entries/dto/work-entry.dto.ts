import { WorkEntry } from '../../entities/work-entry.entity';
import {
  WorkEntrySessionDto,
  parseWorkEntrySessionToDto,
} from './work-entry-session.dto';
import { WorkEntrySession } from '../../entities/work-entry-session.entity';
import { WorkEntryAssignment } from '../../entities/work-entry-assignment.entity';
import { WorkEntryAssignmentDto } from './work-entry-assignment.dto';

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
  status: string;
  sessions: WorkEntrySessionDto[];
  assignments: WorkEntryAssignmentDto[];
  createdAt: string;
  updatedAt: string;
}

export const parseWorkEntryToDto = (
  entry: WorkEntry,
  sessions: WorkEntrySession[] = [],
  assignments: WorkEntryAssignment[] = [],
): WorkEntryDto => {
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
  dto.status = entry.status;
  dto.sessions = sessions.map((s) => parseWorkEntrySessionToDto(s));
  dto.assignments = assignments.map((a) => new WorkEntryAssignmentDto(a));
  dto.createdAt = entry.createdAt.toISOString();
  dto.updatedAt = entry.lastChangedAt.toISOString();
  return dto;
};
