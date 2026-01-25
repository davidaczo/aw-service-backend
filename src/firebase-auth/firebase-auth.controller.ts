import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';
import { LoginDto } from './dto/login.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { CheckEmailResponseDto } from './dto/check-email-reponse.dto';
import { LoginResponseDto } from './dto/login-reponse.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RequireVerifiedEmail } from './decorators/require-email-verified.decorator';
import RequestWithFirebaseUser from './interfaces/request-with-firebase-user.interface';
import { UserDetailedDto } from '../users/dto/user-detailed.dto';
import { UsersService } from '../users/users.service';

@Controller('firebase-auth')
export class FirebaseAuthController {
  constructor(
    private readonly firebaseAuthService: FirebaseAuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return await this.firebaseAuthService.loginUser(dto);
  }

  @Post('check-email')
  async checkEmail(@Body() dto: CheckEmailDto): Promise<CheckEmailResponseDto> {
    return await this.firebaseAuthService.isEmailRegistered(dto);
  }
  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @RequireVerifiedEmail(false)
  async findFirebaseMe(
    @Req() request: RequestWithFirebaseUser,
    @Query('emailVerified') emailVerified = 'false',
  ): Promise<UserDetailedDto> {
    const { user } = request;
    return this.usersService.findFirebaseMe(user, emailVerified === 'true');
  }
}
