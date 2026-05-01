import { WorkEntryAssignment } from '../../entities/work-entry-assignment.entity';
import { WorkEntry } from '../../entities/work-entry.entity';
import { PaginatedList } from '../../dto/paginated-list.dto';
import { WorkEntryDto, parseWorkEntryToDto } from './work-entry.dto';

export class UserAssignedEntryDto {
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

export class PaginatedUserAssignedEntryDto extends PaginatedList<UserAssignedEntryDto> {
  items: UserAssignedEntryDto[];
  meta: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };

  constructor(
    items: UserAssignedEntryDto[],
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
