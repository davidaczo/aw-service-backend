import { WorkEntrySession } from '../../entities/work-entry-session.entity';
import { WorkSessionMediaDto } from './work-session-media.dto';
import * as path from 'path';
import { configService } from '../../config/config.service';

export class WorkEntrySessionDto {
  id: string;
  workEntryId: string;
  userId: string;
  status: string;
  startedAt: string | null;
  pausedAt: string | null;
  stoppedAt: string | null;
  pauseReason: string | null;
  startImages: WorkSessionMediaDto[];
  endImages: WorkSessionMediaDto[];
  createdAt: string;
}

export const parseWorkEntrySessionToDto = (
  session: WorkEntrySession,
): WorkEntrySessionDto => {
  const apiUrl = configService.getApiUrl();
  const dto = new WorkEntrySessionDto();
  dto.id = session.id;
  dto.workEntryId = session.workEntryId;
  dto.userId = session.userId;
  dto.status = session.status;
  dto.startedAt = session.startedAt ? session.startedAt.toISOString() : null;
  dto.pausedAt = session.pausedAt ? session.pausedAt.toISOString() : null;
  dto.stoppedAt = session.stoppedAt ? session.stoppedAt.toISOString() : null;
  dto.pauseReason = session.pauseReason ?? null;
  const allMedia = (session.media ?? []).map((m) => {
    const mediaDto = new WorkSessionMediaDto();
    mediaDto.id = m.id;
    mediaDto.url = `${apiUrl}/uploads/work-session-images/${path.basename(
      m.filePath,
    )}`;
    mediaDto.phase = m.phase;
    return mediaDto;
  });
  dto.startImages = allMedia.filter((m) => m.phase === 'START');
  dto.endImages = allMedia.filter((m) => m.phase === 'END');
  dto.createdAt = session.createdAt.toISOString();
  return dto;
};
