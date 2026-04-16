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

  async createFirebaseUser(
    email: string,
    password: string,
    displayName: string,
  ): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: false,
      });
      return userRecord;
    } catch (error) {
      console.error('Error creating Firebase user:', error);
      if (error.code === 'auth/email-already-exists') {
        throw new BaseException('409use00');
      }
      throw new BaseException('500use02');
    }
  }

  async deleteFirebaseUser(uid: string): Promise<void> {
    try {
      await admin.auth().deleteUser(uid);
    } catch (error) {
      console.error('Error deleting Firebase user:', error);
      throw new BaseException('500use04');
    }
  }

  async updateFirebaseUserEmail(
    uid: string,
    newEmail: string,
  ): Promise<admin.auth.UserRecord> {
    try {
      return await admin.auth().updateUser(uid, {
        email: newEmail,
        emailVerified: false,
      });
    } catch (error) {
      console.error('Error updating Firebase user email:', error);
      if (error.code === 'auth/email-already-exists') {
        throw new BaseException('409use00');
      }
      throw new BaseException('500use05');
    }
  }

  async updateFirebaseUserPassword(
    uid: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await admin.auth().updateUser(uid, {
        password: newPassword,
      });
    } catch (error) {
      console.error('Error updating Firebase user password:', error);
      throw new BaseException('500use06');
    }
  }

  async setFirebaseUserEmailVerified(
    uid: string,
    verified: boolean,
  ): Promise<admin.auth.UserRecord> {
    try {
      return await admin.auth().updateUser(uid, {
        emailVerified: verified,
      });
    } catch (error) {
      console.error('Error setting Firebase email verification:', error);
      throw new BaseException('500use07');
    }
  }

  async disableFirebaseUser(uid: string): Promise<void> {
    try {
      await admin.auth().updateUser(uid, {
        disabled: true,
      });
    } catch (error) {
      console.error('Error disabling Firebase user:', error);
      throw new BaseException('500use08');
    }
  }
}
