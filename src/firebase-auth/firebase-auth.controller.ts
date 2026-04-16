import { Body, Controller, Post } from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';
import { LoginDto } from './dto/login.dto';
import { CheckEmailDto } from './dto/check-email.dto';
import { CheckEmailResponseDto } from './dto/check-email-reponse.dto';
import { LoginResponseDto } from './dto/login-reponse.dto';

@Controller('firebase-auth')
export class FirebaseAuthController {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  @Post()
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    console.log('dto', dto);
    return await this.firebaseAuthService.loginUser(dto);
  }

  @Post('check-email')
  async checkEmail(@Body() dto: CheckEmailDto): Promise<CheckEmailResponseDto> {
    return await this.firebaseAuthService.isEmailRegistered(dto);
  }
}
