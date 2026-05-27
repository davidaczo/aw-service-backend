import {WorkEntryStatus} from "../../entities/enum/work-entry-status.enum";

export interface WorkEntryFilters {
  search?: string;
  priority?: string;
  assignedUserIds?: string;
  clientName?: string;
  machineName?: string;
  machineModel?: string;
  fromDate?: string;
  toDate?: string;
  createdByUserId?: string;
  isAssigned?: boolean;
  status?: WorkEntryStatus;
}
