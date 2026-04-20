import { WorkEntrySession } from '../../entities/work-entry-session.entity';

export class WorkEntrySessionDto {
  id: string;
  workEntryId: string;
  userId: string;
  status: string;
  startedAt: string | null;
  pausedAt: string | null;
  stoppedAt: string | null;
  createdAt: string;
}

export const parseWorkEntrySessionToDto = (
  session: WorkEntrySession,
): WorkEntrySessionDto => {
  const dto = new WorkEntrySessionDto();
  dto.id = session.id;
  dto.workEntryId = session.workEntryId;
  dto.userId = session.userId;
  dto.status = session.status;
  dto.startedAt = session.startedAt ? session.startedAt.toISOString() : null;
  dto.pausedAt = session.pausedAt ? session.pausedAt.toISOString() : null;
  dto.stoppedAt = session.stoppedAt ? session.stoppedAt.toISOString() : null;
  dto.createdAt = session.createdAt.toISOString();
  return dto;
};
