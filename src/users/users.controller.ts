import {
  Controller,
  Get,
  Body,
  Post,
  UseGuards,
  Req,
  Query,
  Put,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { configService } from '../config/config.service';
import { ModificationResponseDto } from '../dto/modification.response.dto';
import { UserSortParam } from './enum';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { UserDto } from './dto/user.dto';
import { UserDetailedDto } from './dto/user-detailed.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { PasswordChangeDto } from './dto/password-change.dto';
import { PwdTokenValidationDto } from './dto/pwd-token-validation.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import {
  SortParam,
  SortParamListValidationPipe,
  UUIDValidationPipe,
} from '../utils/pipes/validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() req: RequestWithUser,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search = '',
    @Query('sort', new SortParamListValidationPipe(UserSortParam, '400use01'))
    sortParams: SortParam[],
    @Query('withMe') withMe = 'false',
  ): Promise<Pagination<UserDto>> {
    return await this.usersService.findAll(
      req,
      search,
      sortParams,
      {
        page,
        limit: Math.min(limit, 20),
        route: configService.getApiUrl('users'),
      },
      withMe === 'true',
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMe(@Req() request: RequestWithUser): Promise<UserDetailedDto> {
    const { user } = request;
    return this.usersService.findMe(user);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Req() request: RequestWithUser,
    @Body() dto: UpdateMeDto,
  ): Promise<ModificationResponseDto> {
    return new ModificationResponseDto(
      await this.usersService.updateMe(request.user, dto),
    );
  }

  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() request: RequestWithUser,
    @Body() dto: PasswordChangeDto,
  ): Promise<ModificationResponseDto> {
    return new ModificationResponseDto(
      await this.usersService.changePassword(request.user, dto),
    );
  }

  @Get('me/reset-password/validate')
  async validateResetResetToken(
    @Query('token') token = '',
  ): Promise<PwdTokenValidationDto> {
    return await this.usersService.validateResetPasswordToken(token);
  }

  @Post('me/reset-password')
  async resetPassword(
    @Body() dto: PasswordResetDto,
  ): Promise<ModificationResponseDto> {
    return new ModificationResponseDto(
      await this.usersService.resetPassword(dto),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(
    @Req() req: RequestWithUser,
    @Param('id', new UUIDValidationPipe('400use02')) id: string,
  ): Promise<UserDto> {
    return await this.usersService.findById(req, id);
  }

  @Post(':id/send-password-reset')
  @UseGuards(JwtAuthGuard)
  async sendPasswordReset(
    @Req() req: RequestWithUser,
    @Param('id', new UUIDValidationPipe('400use02')) id: string,
  ): Promise<ModificationResponseDto> {
    return new ModificationResponseDto(
      await this.usersService.sendPasswordReset(req, id),
    );
  }
}
