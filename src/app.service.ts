import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { UsersService } from './users/users.service';
import { configService } from './config/config.service';
import { subDays } from 'date-fns';
import { Session } from './entities/session.entity';
import { inTransaction } from './utils/sql/transactions';
import { User } from './entities/user.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.generateBaseUser();
    await this.deleteOldSessions();
  }

  @Cron('0 20 4 * * *')
  async deleteOldSessions() {
    await inTransaction(async (queryRunner) => {
      const d = new Date();
      const oldSessions = await queryRunner.manager
        .getRepository(Session)
        .createQueryBuilder('s')
        .where('s.lastUsed < :lsDate', {
          lsDate: subDays(d, 30),
        })
        .andWhere('(s.isDeleted = true or s.refreshTokenExpiration < :date)', {
          date: d,
        })
        .getMany();

      const count = oldSessions.length;
      if (count > 0) {
        for (const session of oldSessions) {
          await queryRunner.manager.delete(Session, { id: session.id });
        }
        console.log(
          `Cleaning service: ${count} old session${
            count > 1 ? 's' : ''
          } deleted`,
        );
      }
    });
  }

  private async generateBaseUser() {
    try {
      if (!(await this.userRepository.find()).length) {
        const { email, password, firstName, lastName } =
          configService.getBaseUserCredentials();
        await this.usersService.create(
          {
            email,
            password,
            firstName,
            lastName,
          },
          true,
        );
        console.log('System user generated.');
      }
    } catch (error) {
      console.error('Failed to generate base user.');
      console.log(error);
    }
  }
}
