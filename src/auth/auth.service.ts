import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import BaseException from '../utils/exceptions/base.exception';
import { addDays, addMinutes } from 'date-fns';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { configService } from '../config/config.service';
import RequestWithUser from './interfaces/request-with-user.interface';
import { ipRegistryService } from '../ip-registry/ip-registry.service';
import { TfaSession } from '../entities/tfa-session.entity';
import { OtpDto } from './dto/otp.dto';
import { TokenPayloadWithUserDto } from './dto/token-payload-with-user.dto';
import { TfaResponseDto } from './dto/tfa-response.dto';
import { TokenPayloadDto } from '../dto/token-payload.dto';
import { User } from '../entities/user.entity';
import {
  getDeviceInfo,
  validateAuthToken,
  verifyOneTimePassword,
} from '../utils/utils';
import { UserDetailedDto } from '../users/dto/user-detailed.dto';
import { inTransaction } from '../utils/sql/transactions';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(TfaSession)
    private readonly tfaSessionRepo: Repository<TfaSession>,
    private readonly usersService: UsersService,
  ) {}

  async getAuthenticatedUser(
    email: string,
    hashedPassword: string,
  ): Promise<User> {
    let user: User;
    try {
      user = await this.usersService.getByEmail(email);
    } catch (error) {
      throw new BaseException('400au00');
    }
    if (!user.password) {
      throw new BaseException('400au00');
    }
    if (!(await bcrypt.compare(hashedPassword, user.password))) {
      throw new BaseException('400au00');
    }
    return user;
  }

  async saveLocationToSession(sessionId: string, ipAddress?: string) {
    try {
      if (ipAddress) {
        const k = await ipRegistryService.getLocationByIp(ipAddress);
        if (k.country || k.city) {
          await this.sessionRepo.update({ id: sessionId }, k);
        }
      }
    } catch (error) {
      console.log('Failed to save location to session');
    }
  }

  async createTfaSession(
    user: User,
  ): Promise<{ session: TfaSession; token: string }> {
    const d = new Date();
    const tokenTTL = Math.floor(
      addMinutes(d, configService.getTfaSessionTTL()).getTime() / 1000,
    );
    const tokenExpiration = new Date(tokenTTL * 1000);
    const tfaSession = await this.tfaSessionRepo.save({
      expiration: tokenExpiration,
      user,
    });
    const tokenClaims = { data: `TFA#${tfaSession.id}`, exp: tokenTTL };
    const token = jwt.sign(tokenClaims, configService.getJwtSecret());
    return { session: tfaSession, token };
  }

  async createSession(
    req: any,
    user: User,
  ): Promise<{ session: Session; tokenPayload: TokenPayloadWithUserDto }> {
    const { operatingSystem, browser, ipAddress } = getDeviceInfo(req);
    const d = new Date();

    const { accessTokenTTL: a, refreshTokenTTL: r } =
      configService.getTokenTTLs();

    const accessTokenTTL = Math.floor(addMinutes(d, a).getTime() / 1000);
    const refreshTokenTTL = Math.floor(addDays(d, r).getTime() / 1000);

    const accessTokenExpiration = new Date(accessTokenTTL * 1000);
    const refreshTokenExpiration = new Date(refreshTokenTTL * 1000);

    const newSession = await this.sessionRepo.save({
      accessTokenExpiration,
      refreshTokenExpiration,
      user,
      ...(!!operatingSystem && { operatingSystem }),
      ...(!!browser && { browser }),
      ...(!!ipAddress && { ipAddress }),
    });

    this.saveLocationToSession(newSession.id, ipAddress);

    const secret = configService.getJwtSecret();

    const accessClaims = {
      data: `ACCESS#${newSession.id}#1`,
      exp: accessTokenTTL,
    };

    const refreshClaims = {
      data: `REFRESH#${newSession.id}#1`,
      exp: refreshTokenTTL,
    };
    const accessToken = jwt.sign(accessClaims, secret);
    const refreshToken = jwt.sign(refreshClaims, secret);

    return {
      session: newSession,
      tokenPayload: {
        accessToken,
        refreshToken,
        accessTokenExpiration: accessTokenExpiration.getTime(),
        refreshTokenExpiration: refreshTokenExpiration.getTime(),
        user: new UserDetailedDto(user),
      },
    };
  }

  private async auth(req: any, user: User) {
    return (await this.createSession(req, user)).tokenPayload;
  }

  async authUser(
    req: RequestWithUser,
  ): Promise<TokenPayloadWithUserDto | TfaResponseDto> {
    const { user } = req;
    if (user.secondFactorEnabled) {
      return {
        secondFactorRequired: true,
        tfaSessionToken: (await this.createTfaSession(user)).token,
      };
    }
    return await this.auth(req, user);
  }

  private async authTfa({ id, user }: TfaSession, code: string) {
    verifyOneTimePassword(code, user.secondFactorSecret);
    await this.tfaSessionRepo.update({ id }, { isDeleted: true });
  }

  async authUserTfa(
    req: any,
    { oneTimePassword }: OtpDto,
  ): Promise<TokenPayloadWithUserDto> {
    const tfaSession = req.tfaSession;
    await this.authTfa(tfaSession, oneTimePassword);
    return await this.auth(req, tfaSession.user);
  }

  async logOut(req: any) {
    const { session } = req;

    return await inTransaction(async (queryRunner) => {
      const res = await queryRunner.manager.update(
        Session,
        { id: session.id },
        { isDeleted: true },
      );
      return res.affected === 1;
    });
  }

  async refreshTokens({
    refreshToken,
  }: RefreshTokenDto): Promise<TokenPayloadDto> {
    const secret = configService.getJwtSecret();
    const { accessTokenTTL: a } = configService.getTokenTTLs();
    try {
      const tokenData = jwt.verify(refreshToken, secret);
      const data = (tokenData as any).data;
      const { id, refreshTokenExpiration, version } = await validateAuthToken(
        data,
        'REFRESH',
      );
      const d = new Date().getTime();
      const accessTokenTTL = Math.floor(addMinutes(d, a).getTime() / 1000);

      return await inTransaction(async (queryRunner) => {
        const newAccessTokenExp = new Date(accessTokenTTL * 1000);
        const newVersion = version + 1;
        await queryRunner.manager.update(
          Session,
          { id },
          {
            accessTokenExpiration: newAccessTokenExp,
            version: newVersion,
          },
        );

        const accessClaims = {
          data: `ACCESS#${id}#${newVersion}`,
          exp: accessTokenTTL,
        };

        const refreshClaims = {
          data: `REFRESH#${id}#${newVersion}`,
          exp: refreshTokenExpiration.getTime() / 1000,
        };

        const accessToken = jwt.sign(accessClaims, secret);
        const refreshToken = jwt.sign(refreshClaims, secret);

        return {
          accessToken,
          refreshToken,
          accessTokenExpiration: newAccessTokenExp.getTime(),
          refreshTokenExpiration: refreshTokenExpiration.getTime(),
        };
      });
    } catch (error) {
      throw new BaseException('401au01');
    }
  }
}
