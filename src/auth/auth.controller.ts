import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthenticationGuard } from './guards/local.guard';
import RequestWithUser from './interfaces/request-with-user.interface';
import { ModificationResponseDto } from '../dto/modification.response.dto';
import { JwtAuthGuard } from './guards/jwt-guard';
import { OtpDto } from './dto/otp.dto';
import { TokenPayloadWithUserDto } from './dto/token-payload-with-user.dto';
import { TfaResponseDto } from './dto/tfa-response.dto';
import { OtpGuard } from './guards/otp-guard';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @UseGuards(LocalAuthenticationGuard)
  async login(
    @Req() request: RequestWithUser,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() dto: LoginDto,
  ): Promise<TokenPayloadWithUserDto | TfaResponseDto> {
    return await this.authService.authUser(request);
  }

  @Post('validate-otp')
  @UseGuards(OtpGuard)
  async validateOneTimePassword(
    @Req() req: Request,
    @Body() dto: OtpDto,
  ): Promise<TokenPayloadWithUserDto> {
    return await this.authService.authUserTfa(req, dto);
  }

  @Post('refresh-tokens')
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<TokenPayloadDto> {
    return await this.authService.refreshTokens(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() request: RequestWithUser,
  ): Promise<ModificationResponseDto> {
    await this.authService.logOut(request);
    return new ModificationResponseDto();
  }
}
