import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as fs from 'fs';
import { WorkEntry } from '../entities/work-entry.entity';
import { WorkEntryStatus } from '../entities/enum/work-entry-status.enum';
import {
  WorkEntrySession,
  WorkEntrySessionStatus,
} from '../entities/work-entry-session.entity';
import { WorkSessionMedia } from '../entities/work-session-media.entity';
import {
  WorkEntryAssignment,
  WorkEntryAssignmentStatus,
} from '../entities/work-entry-assignment.entity';
import { FirebaseUser } from '../entities/firebase.user.entity';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { WorkEntryDto, parseWorkEntryToDto } from './dto/work-entry.dto';
import {
  PaginatedWorkEntryAssignmentDto,
  WorkEntryAssignmentDto,
} from './dto/work-entry-assignment.dto';
import {
  UserAssignedEntryDto,
  PaginatedUserAssignedEntryDto,
} from './dto/user-assigned-entry.dto';
import { PaginatedList } from '../dto/paginated-list.dto';
import BaseException from '../utils/exceptions/base.exception';
import { getCreateValues, getUpdateValues } from '../utils/sql/queries';
import { inTransaction } from '../utils/sql/transactions';
import { UserRole } from '../users/enum/user-role.enum';
import { WorkSessionMediaPhase } from '../entities/enum/work-session-media-phase.enum';
import {UpdateWorkEntrySessionDto} from "./dto/update-work-entry-session.dto";
import {parseWorkEntrySessionToDto, WorkEntrySessionDto} from "./dto/work-entry-session.dto";

@Injectable()
export class WorkEntriesService {
  constructor(
    @InjectRepository(WorkEntry)
    private readonly workEntryRepository: Repository<WorkEntry>,
    @InjectRepository(WorkEntrySession)
    private readonly workEntrySessionRepository: Repository<WorkEntrySession>,
    @InjectRepository(WorkSessionMedia)
    private readonly workSessionMediaRepository: Repository<WorkSessionMedia>,
    @InjectRepository(WorkEntryAssignment)
    private readonly workEntryAssignmentRepository: Repository<WorkEntryAssignment>,
    @InjectRepository(FirebaseUser)
    private readonly firebaseUserRepository: Repository<FirebaseUser>,
  ) {
    fs.mkdirSync('./uploads/work-session-images', { recursive: true });
  }

  async createWorkEntry(
    user: FirebaseUser,
    dto: CreateWorkEntryDto,
  ): Promise<WorkEntryDto> {
    const { assignedUserIds, ...rest } = dto;

    const isAdmin = user.role === UserRole.ADMIN;
    const userIdsToAssign =
      isAdmin && assignedUserIds && assignedUserIds.length > 0
        ? [...new Set(assignedUserIds)]
        : [];

    if (userIdsToAssign.length > 0) {
      const foundUsers = await this.firebaseUserRepository.find({
        where: { id: In(userIdsToAssign), isDeleted: false },
      });
      if (foundUsers.length !== userIdsToAssign.length) {
        throw new BaseException('400we12');
      }
    }

    if (userIdsToAssign.length === 0) {
      const entry = this.workEntryRepository.create({
        ...rest,
        userId: user.id,
      });
      const saved = await this.workEntryRepository.save(entry);
      return parseWorkEntryToDto(saved);
    }

    return inTransaction(async (queryRunner) => {
      const entry = queryRunner.manager.create(WorkEntry, {
        ...rest,
        userId: user.id,
      });
      const savedEntry = await queryRunner.manager.save(WorkEntry, entry);

      const assignments = userIdsToAssign.map((assignedUserId) =>
        queryRunner.manager.create(WorkEntryAssignment, {
          workEntryId: savedEntry.id,
          assignedUserId,
          assignedByUserId: user.id,
          status: WorkEntryAssignmentStatus.PENDING,
          ...getCreateValues(user.id),
        }),
      );
      await queryRunner.manager.save(WorkEntryAssignment, assignments);

      return parseWorkEntryToDto(savedEntry);
    });
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

    const [sessions, assignments] = await Promise.all([
      this.workEntrySessionRepository.find({
        where: { workEntryId: id, isDeleted: false },
        order: { startedAt: 'ASC' },
        relations: ['media'],
      }),
      this.workEntryAssignmentRepository.find({
        where: { workEntryId: id, isDeleted: false },
        relations: ['assignedUser', 'assignedByUser'],
        order: { createdAt: 'ASC' },
      }),
    ]);

    return parseWorkEntryToDto(entry, sessions, assignments);
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
      throw new BaseException('400we03');
    }

    let assignment = await this.workEntryAssignmentRepository.findOne({
      where: { workEntryId: id, assignedUserId: userId, isDeleted: false },
    });

    if (!assignment) {
      assignment = this.workEntryAssignmentRepository.create({
        workEntryId: id,
        assignedUserId: userId,
        assignedByUserId: userId,
        status: WorkEntryAssignmentStatus.STARTED,
        ...getCreateValues(userId),
      });
      await this.workEntryAssignmentRepository.save(assignment);
    } else {
      if (assignment.status === WorkEntryAssignmentStatus.STOPPED) {
        throw new BaseException('400we04');
      }
      if (assignment.status === WorkEntryAssignmentStatus.STARTED) {
        throw new BaseException('400we05');
      }
      Object.assign(assignment, {
        status: WorkEntryAssignmentStatus.STARTED,
        ...getUpdateValues(userId),
      });
      await this.workEntryAssignmentRepository.save(assignment);
    }

    if (entry.status === WorkEntryStatus.TODO) {
      Object.assign(entry, {
        status: WorkEntryStatus.IN_PROGRESS,
        ...getUpdateValues(userId),
      });
      await this.workEntryRepository.save(entry);
    }

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
          phase: WorkSessionMediaPhase.START,
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

    const assignment = await this.workEntryAssignmentRepository.findOne({
      where: { workEntryId: id, assignedUserId: userId, isDeleted: false },
    });

    if (!assignment) {
      throw new BaseException('404we10');
    }

    if (assignment.status !== WorkEntryAssignmentStatus.STARTED) {
      throw new BaseException('400we06');
    }

    const activeSession = await this.workEntrySessionRepository.findOne({
      where: {
        workEntryId: id,
        userId,
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
            phase: WorkSessionMediaPhase.END,
            ...getCreateValues(userId),
          }),
        );
        await this.workSessionMediaRepository.save(mediaRecords);
      }
    }

    Object.assign(assignment, {
      status: WorkEntryAssignmentStatus.PAUSED,
      ...getUpdateValues(userId),
    });
    await this.workEntryAssignmentRepository.save(assignment);
  }

  async resumeWorkEntry(id: string, userId: string): Promise<string> {
    const entry = await this.workEntryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!entry) {
      throw new BaseException('404we00');
    }

    if (entry.status === WorkEntryStatus.STOPPED) {
      throw new BaseException('400we03');
    }

    const assignment = await this.workEntryAssignmentRepository.findOne({
      where: { workEntryId: id, assignedUserId: userId, isDeleted: false },
    });

    if (!assignment) {
      throw new BaseException('404we10');
    }

    if (assignment.status !== WorkEntryAssignmentStatus.PAUSED) {
      throw new BaseException('400we07');
    }

    Object.assign(assignment, {
      status: WorkEntryAssignmentStatus.STARTED,
      ...getUpdateValues(userId),
    });
    await this.workEntryAssignmentRepository.save(assignment);

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

    const assignment = await this.workEntryAssignmentRepository.findOne({
      where: { workEntryId: id, assignedUserId: userId, isDeleted: false },
    });

    if (!assignment) {
      throw new BaseException('404we10');
    }

    if (assignment.status === WorkEntryAssignmentStatus.STOPPED) {
      throw new BaseException('400we04');
    }

    const activeSession = await this.workEntrySessionRepository.findOne({
      where: {
        workEntryId: id,
        userId,
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
            phase: WorkSessionMediaPhase.END,
            ...getCreateValues(userId),
          }),
        );
        await this.workSessionMediaRepository.save(mediaRecords);
      }
    }

    Object.assign(assignment, {
      status: WorkEntryAssignmentStatus.STOPPED,
      ...getUpdateValues(userId),
    });
    await this.workEntryAssignmentRepository.save(assignment);

    const activeCount = await this.workEntryAssignmentRepository.count({
      where: {
        workEntryId: id,
        isDeleted: false,
        status: In([
          WorkEntryAssignmentStatus.STARTED,
          WorkEntryAssignmentStatus.PAUSED,
        ]),
      },
    });

    if (activeCount === 0) {
      Object.assign(entry, {
        status: WorkEntryStatus.STOPPED,
        ...getUpdateValues(userId),
      });
      await this.workEntryRepository.save(entry);
    }
  }

  async getSessionsForWorkEntry(id: string): Promise<WorkEntrySession[]> {
    return this.workEntrySessionRepository.find({
      where: { workEntryId: id, isDeleted: false },
      order: { startedAt: 'ASC' },
      relations: ['media'],
    });
  }

  async assignUser(
    workEntryId: string,
    targetUserId: string,
    adminUser: FirebaseUser,
  ): Promise<WorkEntryAssignmentDto> {
    if (adminUser.role !== UserRole.ADMIN) {
      throw new BaseException('403we10');
    }

    const entry = await this.workEntryRepository.findOne({
      where: { id: workEntryId, isDeleted: false },
    });
    if (!entry) {
      throw new BaseException('404we00');
    }

    const targetUser = await this.firebaseUserRepository.findOne({
      where: { id: targetUserId, isDeleted: false },
    });
    if (!targetUser) {
      throw new BaseException('404we11');
    }

    const existing = await this.workEntryAssignmentRepository.findOne({
      where: { workEntryId, assignedUserId: targetUserId, isDeleted: false },
    });
    if (existing) {
      throw new BaseException('409we10');
    }

    const assignment = this.workEntryAssignmentRepository.create({
      workEntryId,
      assignedUserId: targetUserId,
      assignedByUserId: adminUser.id,
      status: WorkEntryAssignmentStatus.PENDING,
      ...getCreateValues(adminUser.id),
    });
    const saved = await this.workEntryAssignmentRepository.save(assignment);

    const full = await this.workEntryAssignmentRepository.findOne({
      where: { id: saved.id },
      relations: ['assignedUser', 'assignedByUser'],
    });
    return new WorkEntryAssignmentDto(full);
  }

  async removeAssignment(
    workEntryId: string,
    targetUserId: string,
    requestingUser: FirebaseUser,
  ): Promise<void> {
    const assignment = await this.workEntryAssignmentRepository.findOne({
      where: { workEntryId, assignedUserId: targetUserId, isDeleted: false },
    });
    if (!assignment) {
      throw new BaseException('404we10');
    }

    const isSelf = requestingUser.id === targetUserId;
    const isAdmin = requestingUser.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new BaseException('403we10');
    }

    assignment.isDeleted = true;
    Object.assign(assignment, getUpdateValues(requestingUser.id));
    await this.workEntryAssignmentRepository.save(assignment);
  }

  async getAssignments(
    workEntryId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedList<WorkEntryAssignmentDto>> {
    const [assignments, total] =
      await this.workEntryAssignmentRepository.findAndCount({
        where: { workEntryId, isDeleted: false },
        relations: ['assignedUser', 'assignedByUser'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    return new PaginatedWorkEntryAssignmentDto(
      assignments.map((a) => new WorkEntryAssignmentDto(a)),
      {
        page,
        pageSize: assignments.length,
        pageCount: Math.ceil(total / pageSize),
        total,
      },
    );
  }

  async getUserAssignments(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedList<UserAssignedEntryDto>> {
    const [assignments, total] =
      await this.workEntryAssignmentRepository.findAndCount({
        where: { assignedUserId: userId, isDeleted: false },
        relations: ['workEntry', 'assignedByUser'],
        order: { createdAt: 'DESC' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

    const items = assignments
      .filter((a) => a.workEntry && !a.workEntry.isDeleted)
      .map((a) => new UserAssignedEntryDto(a, a.workEntry));

    return new PaginatedUserAssignedEntryDto(items, {
      page,
      pageSize: items.length,
      pageCount: Math.ceil(total / pageSize),
      total,
    });
  }

  async updateSession(
      sessionId: string,
      dto: UpdateWorkEntrySessionDto,
      requestingUser: FirebaseUser,
  ): Promise<WorkEntrySessionDto> {

    if (requestingUser.role !== UserRole.ADMIN) {
      throw new BaseException('403we10');
    }

    const session = await this.workEntrySessionRepository.findOne({
      where: { id: sessionId, isDeleted: false },
      relations: ['media'],
    });

    if (!session) {
      throw new BaseException('404we00');
    }

    const startedAt = dto.startedAt ? new Date(dto.startedAt) : session.startedAt;
    const stoppedAt = dto.stoppedAt ? new Date(dto.stoppedAt) : session.stoppedAt;
    const pausedAt  = dto.pausedAt  ? new Date(dto.pausedAt)  : session.pausedAt;

    if (startedAt && stoppedAt && startedAt >= stoppedAt) {
      throw new BaseException('400we13');
    }

    if (startedAt && pausedAt && startedAt >= pausedAt) {
      throw new BaseException('400we14');
    }

    if (pausedAt && stoppedAt && pausedAt >= stoppedAt) {
      throw new BaseException('400we15');
    }

    Object.assign(session, {
      startedAt,
      stoppedAt,
      pausedAt,
      ...getUpdateValues(requestingUser.id),
    });

    const saved = await this.workEntrySessionRepository.save(session);

    return parseWorkEntrySessionToDto(saved);
  }
}
