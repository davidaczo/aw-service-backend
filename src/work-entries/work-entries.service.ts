import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { WorkEntry } from '../entities/work-entry.entity';
import { WorkEntryStatus } from '../entities/enum/work-entry-status.enum';
import {
  WorkEntrySession,
  WorkEntrySessionStatus,
} from '../entities/work-entry-session.entity';
import { WorkSessionMedia } from '../entities/work-session-media.entity';
import { FirebaseUser } from '../entities/firebase.user.entity';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { WorkEntryDto, parseWorkEntryToDto } from './dto/work-entry.dto';
import { PaginatedList } from '../dto/paginated-list.dto';
import BaseException from '../utils/exceptions/base.exception';
import { getCreateValues, getUpdateValues } from '../utils/sql/queries';

@Injectable()
export class WorkEntriesService {
  constructor(
    @InjectRepository(WorkEntry)
    private readonly workEntryRepository: Repository<WorkEntry>,
    @InjectRepository(WorkEntrySession)
    private readonly workEntrySessionRepository: Repository<WorkEntrySession>,
    @InjectRepository(WorkSessionMedia)
    private readonly workSessionMediaRepository: Repository<WorkSessionMedia>,
  ) {
    fs.mkdirSync('./uploads/work-session-images', { recursive: true });
  }

  async createWorkEntry(
    user: FirebaseUser,
    dto: CreateWorkEntryDto,
  ): Promise<WorkEntryDto> {
    const { ...rest } = dto;
    const entry = this.workEntryRepository.create({
      ...rest,
      userId: user.id,
    });

    const saved = await this.workEntryRepository.save(entry);
    return parseWorkEntryToDto(saved);
  }

  async getWorkEntries(
    page: number,
    pageSize: number,
  ): Promise<PaginatedList<WorkEntryDto>> {
    const [entries, total] = await this.workEntryRepository.findAndCount({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: entries.map((e) => parseWorkEntryToDto(e)),
      meta: {
        page,
        pageSize: entries.length,
        pageCount: Math.ceil(total / pageSize),
        total,
      },
    };
  }

  async getWorkEntriesByUserId(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedList<WorkEntryDto>> {
    const [entries, total] = await this.workEntryRepository.findAndCount({
      where: { userId, isDeleted: false },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: entries.map((e) => parseWorkEntryToDto(e)),
      meta: {
        page,
        pageSize: entries.length,
        pageCount: Math.ceil(total / pageSize),
        total,
      },
    };
  }

  async getWorkEntry(id: string): Promise<WorkEntryDto> {
    const entry = await this.workEntryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!entry) {
      throw new BaseException('404we00');
    }

    const sessions = await this.workEntrySessionRepository.find({
      where: { workEntryId: id, isDeleted: false },
      order: { startedAt: 'ASC' },
      relations: ['media'],
    });

    return parseWorkEntryToDto(entry, sessions);
  }

  async deleteWorkEntry(id: string): Promise<boolean> {
    const entry = await this.workEntryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!entry) {
      throw new BaseException('404we00');
    }

    entry.isDeleted = true;
    await this.workEntryRepository.save(entry);
    return true;
  }

  async startWorkEntry(
    id: string,
    userId: string,
    images?: Express.Multer.File[],
  ): Promise<string> {
    const entry = await this.workEntryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!entry) {
      throw new BaseException('404we00');
    }

    if (entry.status === WorkEntryStatus.STOPPED) {
      throw new BaseException('400we00');
    }

    Object.assign(entry, {
      status: WorkEntryStatus.STARTED,
      ...getUpdateValues(userId),
    });
    await this.workEntryRepository.save(entry);

    const session = this.workEntrySessionRepository.create({
      workEntryId: id,
      userId,
      startedAt: new Date(),
      status: WorkEntrySessionStatus.STARTED,
      ...getCreateValues(userId),
    });
    const savedSession = await this.workEntrySessionRepository.save(session);

    if (images && images.length > 0) {
      const mediaRecords = images.map((file) =>
        this.workSessionMediaRepository.create({
          sessionId: savedSession.id,
          filePath: file.path,
          ...getCreateValues(userId),
        }),
      );
      await this.workSessionMediaRepository.save(mediaRecords);
    }

    return savedSession.id;
  }

  async pauseWorkEntry(
    id: string,
    userId: string,
    reason?: string,
    images?: Express.Multer.File[],
  ): Promise<void> {
    const entry = await this.workEntryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!entry) {
      throw new BaseException('404we00');
    }

    if (entry.status !== WorkEntryStatus.STARTED) {
      throw new BaseException('400we01');
    }

    const activeSession = await this.workEntrySessionRepository.findOne({
      where: {
        workEntryId: id,
        status: WorkEntrySessionStatus.STARTED,
        isDeleted: false,
      },
      order: { startedAt: 'DESC' },
    });

    if (activeSession) {
      Object.assign(activeSession, {
        status: WorkEntrySessionStatus.STOPPED,
        pausedAt: new Date(),
        pauseReason: reason ?? null,
        ...getUpdateValues(userId),
      });
      await this.workEntrySessionRepository.save(activeSession);

      if (images && images.length > 0) {
        const mediaRecords = images.map((file) =>
          this.workSessionMediaRepository.create({
            sessionId: activeSession.id,
            filePath: file.path,
            ...getCreateValues(userId),
          }),
        );
        await this.workSessionMediaRepository.save(mediaRecords);
      }
    }

    Object.assign(entry, {
      status: WorkEntryStatus.PAUSED,
      ...getUpdateValues(userId),
    });
    await this.workEntryRepository.save(entry);
  }

  async resumeWorkEntry(id: string, userId: string): Promise<string> {
    const entry = await this.workEntryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!entry) {
      throw new BaseException('404we00');
    }

    if (entry.status !== WorkEntryStatus.PAUSED) {
      throw new BaseException('400we02');
    }

    Object.assign(entry, {
      status: WorkEntryStatus.STARTED,
      ...getUpdateValues(userId),
    });
    await this.workEntryRepository.save(entry);

    const session = this.workEntrySessionRepository.create({
      workEntryId: id,
      userId,
      startedAt: new Date(),
      status: WorkEntrySessionStatus.STARTED,
      ...getCreateValues(userId),
    });
    const savedSession = await this.workEntrySessionRepository.save(session);
    return savedSession.id;
  }

  async stopWorkEntry(
    id: string,
    userId: string,
    reason?: string,
    images?: Express.Multer.File[],
  ): Promise<void> {
    const entry = await this.workEntryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!entry) {
      throw new BaseException('404we00');
    }

    if (entry.status === WorkEntryStatus.STOPPED) {
      throw new BaseException('400we00');
    }

    const activeSession = await this.workEntrySessionRepository.findOne({
      where: {
        workEntryId: id,
        status: WorkEntrySessionStatus.STARTED,
        isDeleted: false,
      },
      order: { startedAt: 'DESC' },
    });

    if (activeSession) {
      Object.assign(activeSession, {
        status: WorkEntrySessionStatus.STOPPED,
        stoppedAt: new Date(),
        pauseReason: reason ?? null,
        ...getUpdateValues(userId),
      });
      await this.workEntrySessionRepository.save(activeSession);

      if (images && images.length > 0) {
        const mediaRecords = images.map((file) =>
          this.workSessionMediaRepository.create({
            sessionId: activeSession.id,
            filePath: file.path,
            ...getCreateValues(userId),
          }),
        );
        await this.workSessionMediaRepository.save(mediaRecords);
      }
    }

    Object.assign(entry, {
      status: WorkEntryStatus.STOPPED,
      ...getUpdateValues(userId),
    });
    await this.workEntryRepository.save(entry);
  }

  async getSessionsForWorkEntry(id: string): Promise<WorkEntrySession[]> {
    return this.workEntrySessionRepository.find({
      where: { workEntryId: id, isDeleted: false },
      order: { startedAt: 'ASC' },
      relations: ['media'],
    });
  }
}
