import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Req,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { ModificationResponseDto } from '../dto/modification.response.dto';
import { UserDetailedDto } from './dto/user-detailed.dto';
import { UpdateNameDto } from './dto/update-name.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { FirebaseAuthGuard } from '../firebase-auth/guards/firebase-auth.guard';
import RequestWithFirebaseUser from '../firebase-auth/interfaces/request-with-firebase-user.interface';
import { PaginatedListUserDto } from './dto/list-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getAllUsers(
    @Req() request: RequestWithFirebaseUser,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    @Query('search') search?: string,
  ): Promise<PaginatedListUserDto> {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSizeNumber = parseInt(pageSize, 10) || 10;

    return this.usersService.getAllUsers(
      request.user,
      pageNumber,
      pageSizeNumber,
      search,
    );
  }

  @Delete('me')
  @UseGuards(FirebaseAuthGuard)
  async deleteMe(
    @Req() request: RequestWithFirebaseUser,
  ): Promise<ModificationResponseDto> {
    return new ModificationResponseDto(
      await this.usersService.deleteMe(request.user),
    );
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async findMe(
    @Req() request: RequestWithFirebaseUser,
  ): Promise<UserDetailedDto> {
    const { user } = request;
    console.log('user', user);
    return this.usersService.findMe(user);
  }

  @Put('me/name')
  @UseGuards(FirebaseAuthGuard)
  async updateName(
    @Req() request: RequestWithFirebaseUser,
    @Body() dto: UpdateNameDto,
  ): Promise<UserDetailedDto> {
    return this.usersService.updateName(request.user, dto);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createUser(
    @Req() request: RequestWithFirebaseUser,
    @Body() dto: AdminCreateUserDto,
  ): Promise<UserDetailedDto> {
    return this.usersService.adminCreateUser(request.user, dto);
  }

  @Post('profile-image')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      storage: diskStorage({
        destination: './uploads/profile-images',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `profile-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithFirebaseUser,
  ): Promise<UserDetailedDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return await this.usersService.handleProfileImageUpload(req, file);
  }

  @Delete('profile-image')
  @UseGuards(FirebaseAuthGuard)
  async deleteProfileImage(
    @Req() req: RequestWithFirebaseUser,
  ): Promise<ModificationResponseDto> {
    return this.usersService.deleteProfileImage(req.user);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async getUserById(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
  ): Promise<UserDetailedDto> {
    return this.usersService.getUserById(request.user, id);
  }

  @Put(':id/make-admin')
  @UseGuards(FirebaseAuthGuard)
  async makeUserAdmin(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const success = await this.usersService.makeUserAdmin(request.user, id);
    return { success };
  }

  @Put(':id/revoke-admin')
  @UseGuards(FirebaseAuthGuard)
  async revokeAdminStatus(
    @Req() request: RequestWithFirebaseUser,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const success = await this.usersService.revokeAdminStatus(request.user, id);
    return { success };
  }

  @Put('me/password')
  @UseGuards(FirebaseAuthGuard)
  async updatePassword(
    @Req() request: RequestWithFirebaseUser,
    @Body() dto: { newPassword: string },
  ): Promise<ModificationResponseDto> {
    return new ModificationResponseDto(
      await this.usersService.updatePassword(request.user, dto.newPassword),
    );
  }
}
