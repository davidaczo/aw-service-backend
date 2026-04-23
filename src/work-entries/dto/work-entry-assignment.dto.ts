import { WorkEntryAssignment } from '../../entities/work-entry-assignment.entity';
import { PaginatedList } from '../../dto/paginated-list.dto';
import { WorkEntryDto, parseWorkEntryToDto } from './work-entry.dto';
import { WorkEntry } from '../../entities/work-entry.entity';

export class WorkEntryAssignmentDto {
  id: string;
  workEntryId: string;
  assignedUserId: string;
  assignedUserName: string;
  assignedByUserId: string;
  assignedByUserName: string;
  status: string;
  createdAt: string;

  constructor(assignment: WorkEntryAssignment) {
    this.id = assignment.id;
    this.workEntryId = assignment.workEntryId;
    this.assignedUserId = assignment.assignedUserId;
    this.assignedUserName = assignment.assignedUser?.name ?? '';
    this.assignedByUserId = assignment.assignedByUserId;
    this.assignedByUserName = assignment.assignedByUser?.name ?? '';
    this.status = assignment.status;
    this.createdAt = assignment.createdAt.toISOString();
  }
}

export class PaginatedWorkEntryAssignmentDto extends PaginatedList<WorkEntryAssignmentDto> {
  items: WorkEntryAssignmentDto[];
  meta: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };

  constructor(
    items: WorkEntryAssignmentDto[],
    meta: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    },
  ) {
    super();
    this.items = items;
    this.meta = meta;
  }
}

export class AssignedWorkEntryDto {
  assignmentId: string;
  workEntry: WorkEntryDto;
  assignedAt: string;
  assignedByUserId: string;
  assignedByUserName: string;
  status: string;

  constructor(assignment: WorkEntryAssignment, workEntry: WorkEntry) {
    this.assignmentId = assignment.id;
    this.workEntry = parseWorkEntryToDto(workEntry);
    this.assignedAt = assignment.createdAt.toISOString();
    this.assignedByUserId = assignment.assignedByUserId;
    this.assignedByUserName = assignment.assignedByUser?.name ?? '';
    this.status = assignment.status;
  }
}

export class PaginatedAssignedWorkEntryDto extends PaginatedList<AssignedWorkEntryDto> {
  items: AssignedWorkEntryDto[];
  meta: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };

  constructor(
    items: AssignedWorkEntryDto[],
    meta: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    },
  ) {
    super();
    this.items = items;
    this.meta = meta;
  }
}
