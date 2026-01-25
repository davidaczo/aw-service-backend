import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import BaseException from '../utils/exceptions/base.exception';

@Injectable()
export class FirebaseService {
  async getAllUsers(nextPageToken?: string): Promise<admin.auth.UserRecord[]> {
    const users: admin.auth.UserRecord[] = [];

    const listUsersRecursive = async (pageToken?: string) => {
      const result = await admin.auth().listUsers(1000, pageToken);
      users.push(...result.users);
      if (result.pageToken) {
        await listUsersRecursive(result.pageToken);
      }
    };

    await listUsersRecursive(nextPageToken);
    return users;
  }

  async getUserById(firebaseId: string): Promise<admin.auth.UserRecord> {
    try {
      return await admin.auth().getUser(firebaseId);
    } catch (error) {
      throw new BaseException('404use01');
    }
  }
}
