import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import BaseException from '../utils/exceptions/base.exception';
import { UserRole } from './enum/user-role.enum';
import { UserDetailedDto } from './dto/user-detailed.dto';
import { UpdateNameDto } from './dto/update-name.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { inTransaction } from '../utils/sql/transactions';
import { getUpdateValues } from '../utils/sql/queries';
import { FirebaseUser } from '../entities/firebase.user.entity';
import { FirebaseService } from '../firebase/firebase.service';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import RequestWithFirebaseUser from '../firebase-auth/interfaces/request-with-firebase-user.interface';
import { ModificationResponseDto } from '../dto/modification.response.dto';
import { OnboardingStep } from './enum/onboarding-step';
import { ListUserDto, PaginatedListUserDto } from './dto/list-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(FirebaseUser)
    private readonly firebaseRepository: Repository<FirebaseUser>,
    private readonly firebaseService: FirebaseService,
  ) {}

  async findMe(user: FirebaseUser): Promise<UserDetailedDto> {
    return new UserDetailedDto(user);
  }

  async deleteMe(user: FirebaseUser): Promise<boolean> {
    try {
      const res = await this.firebaseRepository.update(
        { id: user.id },
        {
          ...getUpdateValues(user.id),
          email: null,
          name: null,
          photoUrl: null,
          isDeleted: true,
        },
      );

      if (res.affected === 1) {
        await this.firebaseService.disableFirebaseUser(user.firebaseId);
      }

      return res.affected === 1;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new BaseException('500use09');
    }
  }

  async getAllUsers(
    user: FirebaseUser,
    page = 1,
    pageSize = 10,
    search?: string,
  ): Promise<PaginatedListUserDto> {
    let qb = this.firebaseRepository
      .createQueryBuilder('user')
      .where('user.isDeleted = :isDeleted', { isDeleted: false })
      .select(['user.id', 'user.name', 'user.email', 'user.role']);

    if (search && search.length >= 2) {
      qb = qb.andWhere(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();
    const skip = (page - 1) * pageSize;
    qb = qb.orderBy('user.name', 'ASC').skip(skip).take(pageSize);
    const users = await qb.getMany();

    const items = users.map(
      (user) =>
        new ListUserDto({
          id: user.id,
          name: user.name || '',
          photoUrl: user.photoUrl || '',
          email: user.email || '',
          role: user.role,
        }),
    );

    const pageCount = Math.ceil(total / pageSize);

    return new PaginatedListUserDto(items, {
      page,
      pageSize,
      pageCount,
      total,
    });
  }

  async updatePassword(
    user: FirebaseUser,
    newPassword: string,
  ): Promise<boolean> {
    try {
      await this.firebaseService.updateFirebaseUserPassword(
        user.firebaseId,
        newPassword,
      );

      // Update password reset token
      await this.firebaseRepository.update(
        { id: user.id },
        {
          ...getUpdateValues(user.id),
        },
      );

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new BaseException('500use10');
    }
  }

  async updateName(
    user: FirebaseUser,
    dto: UpdateNameDto,
  ): Promise<UserDetailedDto> {
    const fullName = `${dto.firstName} ${dto.lastName}`.trim();

    await this.firebaseRepository.update(
      { id: user.id },
      {
        name: fullName,
        onboardingStep: OnboardingStep.COMPLETED,
        ...getUpdateValues(user.id),
      },
    );

    const updatedUser = await this.firebaseRepository.findOne({
      where: { id: user.id },
    });

    return new UserDetailedDto(updatedUser);
  }

  async handleProfileImageUpload(
    req: RequestWithFirebaseUser,
    file: Express.Multer.File,
  ): Promise<UserDetailedDto> {
    if (!file) {
      throw new BaseException('400use03');
    }

    const newPhotoUrl = `/uploads/profile-images/${file.filename}`;

    const currentPhotoUrl = req.user?.photoUrl;
    if (
      currentPhotoUrl &&
      currentPhotoUrl.includes(`/uploads/profile-images/`)
    ) {
      const oldFileName = currentPhotoUrl.split('/').pop();
      const oldFilePath = join(
        __dirname,
        '..',
        '..',
        'uploads',
        'profile-images',
        oldFileName,
      );

      try {
        if (existsSync(oldFilePath)) {
          unlinkSync(oldFilePath);
        }
      } catch (err) {
        throw new BaseException('500use01');
      }
    }

    await this.firebaseRepository.update(
      { id: req.user.id },
      { photoUrl: newPhotoUrl },
    );

    const updatedUser = await this.firebaseRepository.findOne({
      where: { id: req.user.id },
    });

    return new UserDetailedDto(updatedUser);
  }

  async getUserById(
    adminUser: FirebaseUser,
    id: string,
  ): Promise<UserDetailedDto> {
    // if (adminUser.role !== UserRole.ADMIN) {
    //   throw new BaseException('403use00');
    // }

    const user = await this.firebaseRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new BaseException('404use00');
    }

    return new UserDetailedDto(user);
  }

  async makeUserAdmin(adminUser: FirebaseUser, id: string): Promise<boolean> {
    // if (adminUser.role !== UserRole.ADMIN) {
    //   throw new BaseException('403use00');
    // }

    const user = await this.firebaseRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new BaseException('404use00');
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const result = await this.firebaseRepository.update(
      { id },
      {
        role: UserRole.ADMIN,
        ...getUpdateValues(adminUser.id),
      },
    );

    return result.affected === 1;
  }

  async revokeAdminStatus(
    adminUser: FirebaseUser,
    id: string,
  ): Promise<boolean> {
    // if (adminUser.role !== UserRole.ADMIN) {
    //   throw new BaseException('403use00');
    // }

    if (adminUser.id === id) {
      throw new BaseException('400use00'); // can't revoke yourself
    }

    const user = await this.firebaseRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new BaseException('404use00');
    }

    if (user.role !== UserRole.ADMIN) {
      return true; // already not admin, no-op
    }

    const result = await this.firebaseRepository.update(
      { id },
      {
        role: UserRole.USER,
        ...getUpdateValues(adminUser.id),
      },
    );

    return result.affected === 1;
  }

  async deleteProfileImage(
    user: FirebaseUser,
  ): Promise<ModificationResponseDto> {
    try {
      const currentPhotoUrl = user.photoUrl;

      if (
        currentPhotoUrl &&
        currentPhotoUrl.includes('/uploads/profile-images/')
      ) {
        const fileName = currentPhotoUrl.split('/').pop();
        const filePath = join(
          __dirname,
          '..',
          '..',
          'uploads',
          'profile-images',
          fileName,
        );

        try {
          if (existsSync(filePath)) {
            unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Error deleting profile image file:', err);
        }
      }

      await this.firebaseRepository.update({ id: user.id }, { photoUrl: null });

      return new ModificationResponseDto(true);
    } catch (error) {
      if (error instanceof BaseException) {
        throw error;
      }
      throw new BaseException('500use05');
    }
  }

  async adminCreateUser(
    adminUser: FirebaseUser,
    dto: AdminCreateUserDto,
  ): Promise<UserDetailedDto> {
    // if (adminUser.role !== UserRole.ADMIN) {
    //   throw new BaseException('403use00');
    // }

    await this.validateEmail(dto.email);

    const fullName = `${dto.firstName} ${dto.lastName}`.trim();

    let firebaseUserRecord: admin.auth.UserRecord;
    try {
      firebaseUserRecord = await this.firebaseService.createFirebaseUser(
        dto.email,
        dto.password,
        fullName,
      );
    } catch (error) {
      throw error;
    }

    try {
      return await inTransaction(async (queryRunner) => {
        const newUser = await queryRunner.manager.save(FirebaseUser, {
          firebaseId: firebaseUserRecord.uid,
          email: dto.email,
          name: fullName,
          photoUrl: null,
          isEmailVerified: true,
          role: UserRole.USER,
          createdBy: adminUser.id,
          lastChangedBy: adminUser.id,
          onboardingStep: OnboardingStep.SET_PERSONAL_DATA,
        });

        return new UserDetailedDto(newUser);
      });
    } catch (error) {
      try {
        await this.firebaseService.deleteFirebaseUser(firebaseUserRecord.uid);
      } catch (deleteError) {
        console.error(
          'Error rolling back Firebase user creation:',
          deleteError,
        );
      }
      throw new BaseException('500use03');
    }
  }

  private async validateEmail(email: string) {
    const u = await this.firebaseRepository.findOne({
      where: { email, isDeleted: false },
    });
    if (u) {
      throw new BaseException('409use00');
    }
  }
}
