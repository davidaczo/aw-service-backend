import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FirebaseAuthGuard } from '../firebase-auth/guards/firebase-auth.guard';
import RequestWithFirebaseUser from '../firebase-auth/interfaces/request-with-firebase-user.interface';
import { WorkEntriesService } from './work-entries.service';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { WorkEntryDto } from './dto/work-entry.dto';
import {
  WorkEntrySessionDto,
  parseWorkEntrySessionToDto,
} from './dto/work-entry-session.dto';
import {
  AssignedWorkEntryDto,
  WorkEntryAssignmentDto,
} from './dto/work-entry-assignment.dto';
import { PauseWorkEntryDto } from './dto/pause-work-entry.dto';
import { StopWorkEntryDto } from './dto/stop-work-entry.dto';
import { PaginatedList } from '../dto/paginated-list.dto';
import { num } from '../utils/utils';

@Controller('work-entries')
@UseGuards(FirebaseAuthGuard)
export class WorkEntriesController {
  constructor(private readonly workEntriesService: WorkEntriesService) {}

  @Post()
  async createWorkEntry(
    @Req() request: RequestWithFirebaseUser,
    @Body() dto: CreateWorkEntryDto,
  ): Promise<WorkEntryDto> {
    return this.workEntriesService.createWorkEntry(request.user, dto);
  }

  @Get()
  async getWorkEntries(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ): Promise<PaginatedList<WorkEntryDto>> {
    return this.workEntriesService.getWorkEntries(num(page), num(pageSize));
  }

  @Get('user/:userId')
  async getWorkEntriesByUserId(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ): Promise<PaginatedList<WorkEntryDto>> {
    return this.workEntriesService.getWorkEntriesByUserId(
      userId,
      num(page),
      num(pageSize),
    );
  }

  @Get(':id')
  async getWorkEntry(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
  ): Promise<WorkEntryDto> {
    return this.workEntriesService.getWorkEntry(id);
  }

  @Delete(':id')
  async deleteWorkEntry(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
  ): Promise<boolean> {
    return this.workEntriesService.deleteWorkEntry(id);
  }

  @Put(':id/start')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: diskStorage({
        destination: './uploads/work-session-images',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async startWorkEntry(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<{ id: string }> {
    const sessionId = await this.workEntriesService.startWorkEntry(
      id,
      request.user.id,
      images,
    );
    return { id: sessionId };
  }

  @Put(':id/pause')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: diskStorage({
        destination: './uploads/work-session-images',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async pauseWorkEntry(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
    @Body() dto: PauseWorkEntryDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<void> {
    return this.workEntriesService.pauseWorkEntry(
      id,
      request.user.id,
      dto.reason,
      images,
    );
  }

  @Put(':id/resume')
  async resumeWorkEntry(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
  ): Promise<{ id: string }> {
    const sessionId = await this.workEntriesService.resumeWorkEntry(
      id,
      request.user.id,
    );
    return { id: sessionId };
  }

  @Put(':id/stop')
  @UseInterceptors(
    FilesInterceptor('images', 20, {
      storage: diskStorage({
        destination: './uploads/work-session-images',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9,
          )}`;
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async stopWorkEntry(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
    @Body() dto: StopWorkEntryDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<void> {
    if (!images || images.length === 0) {
      throw new BadRequestException(
        'At least one image is required to stop a work entry',
      );
    }
    return this.workEntriesService.stopWorkEntry(
      id,
      request.user.id,
      dto.reason,
      images,
    );
  }

  @Get(':id/sessions')
  async getSessionsForWorkEntry(
    @Param('id') id: string,
  ): Promise<WorkEntrySessionDto[]> {
    const sessions = await this.workEntriesService.getSessionsForWorkEntry(id);
    return sessions.map((s) => parseWorkEntrySessionToDto(s));
  }

  @Post(':id/assignments/:userId')
  @UseGuards(FirebaseAuthGuard)
  async assignUser(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<WorkEntryAssignmentDto> {
    return this.workEntriesService.assignUser(id, userId, request.user);
  }

  @Delete(':id/assignments/:userId')
  @UseGuards(FirebaseAuthGuard)
  async removeAssignment(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.workEntriesService.removeAssignment(id, userId, request.user);
  }

  @Get(':id/assignments')
  @UseGuards(FirebaseAuthGuard)
  async getAssignments(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ): Promise<PaginatedList<WorkEntryAssignmentDto>> {
    return this.workEntriesService.getAssignments(id, num(page), num(pageSize));
  }

  @Get('user/:userId/assignments')
  @UseGuards(FirebaseAuthGuard)
  async getUserAssignments(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ): Promise<PaginatedList<AssignedWorkEntryDto>> {
    return this.workEntriesService.getUserAssignments(
      userId,
      num(page),
      num(pageSize),
    );
  }
}
