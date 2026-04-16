import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../firebase-auth/guards/firebase-auth.guard';
import RequestWithFirebaseUser from '../firebase-auth/interfaces/request-with-firebase-user.interface';
import { WorkEntriesService } from './work-entries.service';
import { CreateWorkEntryDto } from './dto/create-work-entry.dto';
import { WorkEntryDto } from './dto/work-entry.dto';
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
}
