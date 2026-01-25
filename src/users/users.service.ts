import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import BaseException from '../utils/exceptions/base.exception';
import RequestWithUser from '../auth/interfaces/request-with-user.interface';
import { UserRole } from './enum/user-role.enum';
import { User } from '../entities/user.entity';
import { UserDto } from './dto/user.dto';
import { UserDetailedDto } from './dto/user-detailed.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { PasswordChangeDto } from './dto/password-change.dto';
import { PwdTokenValidationDto } from './dto/pwd-token-validation.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { SortParam } from '../utils/pipes/validation.pipe';
import { normalize, num } from '../utils/utils';
import { inTransaction } from '../utils/sql/transactions';
import { getUpdateValues } from '../utils/sql/queries';
import { FirebaseUser } from '../entities/firebase.user.entity';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(FirebaseUser)
    private readonly firebaseUserRepository: Repository<FirebaseUser>,
    private readonly firebaseService: FirebaseService,
  ) {}

  private async paginate(
    user: User,
    search: string,
    sortParams: SortParam[] = [],
    options: IPaginationOptions,
    withMe: boolean,
  ): Promise<Pagination<UserDto>> {
    let qb = this.repository
      .createQueryBuilder('user')
      .where('user.isDeleted = :isDeleted', { isDeleted: false });

    if (!withMe) {
      qb = qb.andWhere('user.id <> :userId', {
        userId: user.id,
      });
    }

    if (search && search.length >= 2) {
      qb = qb.andWhere('user.searchValue like :search', {
        search: `%${normalize(search)}%`,
      });
    }

    const l = num(options.limit);
    const p = num(options.page);

    const count = (await qb.getMany()).length;

    qb = qb.limit(l).offset((p - 1) * l);

    if (sortParams.length) {
      const [first, ...rest] = sortParams;
      qb = qb.orderBy(`user.${first.column}`, first.direction);
      rest.forEach(({ column, direction }) => {
        qb = qb.addOrderBy(`user.${column}`, direction);
      });
    } else {
      qb = qb.orderBy('user.lastName', 'ASC');
    }

    const page = await qb.getMany();

    const items: UserDto[] = [];

    for (let i = 0; i < page.length; i += 1) {
      const { id, firstName, lastName, email, passwordResetToken } = page[i];

      const data = {
        id,
        firstName,
        lastName,
        email,
        passwordResetToken,
      };
      items.push(new UserDto(data));
    }

    const meta = {
      totalItems: count,
      itemCount: page.length,
      itemsPerPage: l,
      totalPages: Math.ceil(count / l),
      currentPage: p,
    };

    return new Pagination<UserDto>(items, meta);
  }

  async findMe(user: User): Promise<UserDetailedDto> {
    return new UserDetailedDto(user);
  }

  async findFirebaseMe(
    user: FirebaseUser,
    emailVerified: boolean,
  ): Promise<UserDetailedDto> {
    if (!user) {
      throw new BaseException('500use00');
    }
    let u = user;
    console.log('findFirebaseMe', u.isEmailVerified, emailVerified);
    if (!u.isEmailVerified && emailVerified) {
      const userRecord = await this.firebaseService.getUserById(u.firebaseId);
      if (userRecord.emailVerified) {
        await this.firebaseUserRepository.update(
          { id: u.id },
          { isEmailVerified: true },
        );
        u = await this.firebaseUserRepository.findOne({ id: u.id });
      }
    }
    return new UserDetailedDto(u);
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { email, isDeleted: false },
    });
    if (!user) {
      throw new BaseException('404use00');
    }
    return user;
  }

  async getById(id: string, isDeleted: null | boolean = false): Promise<User> {
    let qb = this.repository
      .createQueryBuilder('user')
      .where('user.id = :id', { id });

    if (isDeleted !== null) {
      qb = qb.andWhere('user.isDeleted = :isDeleted', { isDeleted });
    }

    const user = await qb.getOne();
    if (!user) {
      throw new BaseException('404use00');
    }
    return user;
  }

  async findAll(
    req: RequestWithUser,
    search: string,
    sortParams: SortParam[],
    options: IPaginationOptions,
    withMe = true,
  ): Promise<Pagination<UserDto>> {
    const { user } = req;
    if (user.role !== UserRole.ADMIN) {
      throw new BaseException('403use00');
    }
    return this.paginate(user, search, sortParams, options, withMe);
  }

  async findById(req: RequestWithUser, id: string): Promise<UserDto> {
    const { user } = req;
    if (user.role !== UserRole.ADMIN) {
      throw new BaseException('403use00');
    }
    const u = await this.getById(id);

    const data = {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      passwordResetToken: u.passwordResetToken,
    };
    return new UserDto(data);
  }

  private async validateEmail(email: string) {
    const u = await this.repository.findOne({
      where: { email, isDeleted: false },
    });
    if (u) {
      throw new BaseException('409use00');
    }
  }

  async create(
    { email, password, firstName, lastName }: CreateUserDto,
    createdBySystem = false,
  ): Promise<string> {
    await this.validateEmail(email);

    const newUser = await this.repository.save({
      email,
      ...(!!password && { password: await bcrypt.hash(password, 10) }),
      passwordResetToken: crypto.randomBytes(64).toString('hex'),
      firstName,
      lastName,
      searchValue: normalize(`${lastName}${firstName}${lastName}`),
      createdBy: createdBySystem ? 'system' : 'self',
      lastChangedBy: createdBySystem ? 'system' : 'self',
    });

    return newUser.id;
  }

  async updateMe(user: User, dto: UpdateMeDto): Promise<boolean> {
    const emailChanged = dto.email !== user.email;
    if (emailChanged) {
      await this.validateEmail(dto.email);
    }
    const nameChanged =
      dto.firstName !== user.firstName || dto.lastName !== user.lastName;

    return await inTransaction(async (queryRunner) => {
      const res = await queryRunner.manager.update(
        User,
        { id: user.id },
        {
          ...getUpdateValues('self'),
          ...dto,
          ...(nameChanged && {
            searchValue: normalize(
              `${dto.lastName}${dto.firstName}${dto.lastName}`,
            ),
          }),
        },
      );
      return res.affected === 1;
    });
  }

  async changePassword(user: User, dto: PasswordChangeDto): Promise<boolean> {
    if (!(await bcrypt.compare(dto.currentPassword, user.password))) {
      throw new BaseException('400pas01');
    }
    const res = await this.repository.update(
      { id: user.id },
      {
        ...getUpdateValues(user.id),
        password: await bcrypt.hash(dto.newPassword, 10),
        passwordResetToken: crypto.randomBytes(64).toString('hex'),
      },
    );
    return res.affected === 1;
  }

  async validateResetPasswordToken(
    token: string,
  ): Promise<PwdTokenValidationDto> {
    const user = await this.repository.findOne({
      passwordResetToken: token,
      isDeleted: false,
    });
    if (!user) {
      throw new BaseException('400pas00');
    }
    return new PwdTokenValidationDto(
      user.email,
      user.firstName,
      user.lastName,
      !!user.password,
    );
  }

  async resetPassword({ token, password }: PasswordResetDto): Promise<boolean> {
    const user = await this.repository.findOne({
      passwordResetToken: token,
      isDeleted: false,
    });
    if (!user) {
      throw new BaseException('400pas00');
    }
    const res = await this.repository.update(
      { id: user.id },
      {
        password: await bcrypt.hash(password, 10),
        passwordResetToken: crypto.randomBytes(64).toString('hex'),
      },
    );
    return res.affected === 1;
  }

  async sendPasswordReset(req: RequestWithUser, id: string): Promise<boolean> {
    const { user } = req;
    if (user.role !== UserRole.ADMIN) {
      throw new BaseException('403use00');
    }
    const recipient = await this.getById(id);
    console.log(
      `Password reset token requested from: ${recipient.lastName} ${recipient.firstName}`,
    );
    // TODO mailing here
    // await mailService.sendPasswordResetMail(recipient);
    return true;
  }
}
