import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkEntry } from '../entities/work-entry.entity';
import { FirebaseUser } from '../entities/firebase.user.entity';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { WorkEntryDto, parseWorkEntryToDto } from './dto/work-entry.dto';
import { PaginatedList } from '../dto/paginated-list.dto';

@Injectable()
export class WorkEntriesService {
  constructor(
    @InjectRepository(WorkEntry)
    private readonly workEntryRepository: Repository<WorkEntry>,
  ) {}

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
      items: entries.map(parseWorkEntryToDto),
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
      items: entries.map(parseWorkEntryToDto),
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
      throw new NotFoundException('Work entry not found');
    }

    return parseWorkEntryToDto(entry);
  }

  async deleteWorkEntry(id: string): Promise<boolean> {
    const entry = await this.workEntryRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!entry) {
      throw new NotFoundException('Work entry not found');
    }

    entry.isDeleted = true;
    await this.workEntryRepository.save(entry);
    return true;
  }
}
