import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { SavePushTokenDto } from './dto/save-push-token.dto';
import { FirebaseUser } from '../entities/firebase.user.entity';
import { PushToken } from '../entities/push-tokens.entity';
import {
  Notification,
  NotificationType,
} from '../entities/notifications.entity';
import { PaginatedList } from '../dto/paginated-list.dto';
import {
  NotificationResponseDto,
  parseNotificationEntityToDto,
} from './dto/notifications.dto';

@Injectable()
export class NotificationService {
  private expo: Expo;

  constructor(
    @InjectRepository(FirebaseUser)
    private readonly userRepository: Repository<FirebaseUser>,
    @InjectRepository(PushToken)
    private readonly pushTokenRepository: Repository<PushToken>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    this.expo = new Expo();
  }

  async savePushToken(userId: string, dto: SavePushTokenDto): Promise<boolean> {
    const { pushToken, deviceId, deviceType, deviceName } = dto;

    if (!Expo.isExpoPushToken(pushToken)) {
      throw new Error(`Push token ${pushToken} is not a valid Expo push token`);
    }

    const existingToken = await this.pushTokenRepository.findOne({
      where: { userId, token: dto.pushToken },
    });

    if (existingToken) {
      existingToken.token = pushToken;
      existingToken.deviceType = deviceType || existingToken.deviceType;
      existingToken.deviceName = deviceName || existingToken.deviceName;
      existingToken.isActive = true;
      existingToken.lastUsedAt = new Date();
      const res = await this.pushTokenRepository.save(existingToken);

      setTimeout(async () => {
        await this.sendNotificationToUser(
          userId,
          'Test Notification',
          'This is a test notification to verify your push token is working.',
        );
      }, 10000);
      return res != null;
    }

    const newToken = this.pushTokenRepository.create({
      token: pushToken,
      userId,
      deviceId,
      deviceType,
      deviceName,
      isActive: true,
      lastUsedAt: new Date(),
    });

    const res = await this.pushTokenRepository.save(newToken);
    return res != null;
  }

  async removePushToken(userId: string, deviceId: string): Promise<boolean> {
    const res = await this.pushTokenRepository.delete({ userId, deviceId });
    return res.affected > 0;
  }

  async removeAllPushTokens(userId: string): Promise<boolean> {
    const res = await this.pushTokenRepository.delete({ userId });
    return res.affected > 0;
  }

  async getUserPushTokens(userId: string): Promise<PushToken[]> {
    return this.pushTokenRepository.find({
      where: { userId, isActive: true },
    });
  }

  async sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const tokens = [{ token: 'ExponentPushToken[eOYgMCJ3-vfZEQqge-gEcg]' }];

    if (tokens.length === 0) {
      return false;
    }

    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token.token,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
    }));

    await this.sendPushNotifications(messages);
    await this.saveNotification(
      userId,
      title,
      body,
      data,
      NotificationType.DEFAULT,
    );
    await this.pushTokenRepository.update(
      { userId },
      { lastUsedAt: new Date() },
    );
    return true;
  }

  async sendNotificationToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    const users = await this.userRepository.find({
      where: { id: In(userIds) },
    });

    const enabledUserIds = users.map((user) => user.id);

    if (enabledUserIds.length === 0) {
      console.log('No valid user ids found for user:', users);
      return;
    }

    const tokens = await this.pushTokenRepository.find({
      where: {
        userId: In(enabledUserIds),
        isActive: true,
      },
    });

    if (tokens.length === 0) {
      console.log('No valid user ids found for user:', users);
      return;
    }

    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token.token,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
    }));

    await this.sendPushNotifications(messages);
    for (const userId of enabledUserIds) {
      await this.saveNotification(
        userId,
        title,
        body,
        data,
        NotificationType.DEFAULT,
      );
    }
  }

  async sendNotificationToAll(
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    const users = await this.userRepository.find({
      where: { notificationsEnabled: true },
    });

    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) {
      console.log('No valid user ids found for user:', users);
      return;
    }

    const tokens = await this.pushTokenRepository.find({
      where: {
        userId: In(userIds),
        isActive: true,
      },
    });

    if (tokens.length === 0) {
      console.log('No valid user ids found for user:', users);
      return;
    }

    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token.token,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
    }));

    await this.sendPushNotifications(messages);
    for (const userId of userIds) {
      await this.saveNotification(
        userId,
        title,
        body,
        data,
        NotificationType.DEFAULT,
      );
    }
  }

  async saveNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
    notificationType: NotificationType = NotificationType.DEFAULT,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      title,
      body,
      data,
      notificationType,
    });

    return this.notificationRepository.save(notification);
  }

  async getUserNotifications(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<PaginatedList<NotificationResponseDto>> {
    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const parsedDtos = notifications.map((notification) =>
      parseNotificationEntityToDto(notification),
    );
    const start = (page - 1) * pageSize;
    const parsedPaginatedItems = parsedDtos.slice(start, start + pageSize);
    const count = notifications.length;

    return {
      items: parsedPaginatedItems,
      meta: {
        page,
        pageSize: parsedPaginatedItems.length,
        pageCount: Math.ceil(count / pageSize),
        total: count,
      },
    };
  }

  private async sendPushNotifications(
    messages: ExpoPushMessage[],
  ): Promise<void> {
    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.log(error);
      }
    }
    console.log('Sending push notifications in', tickets, messages);
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (ticket.status === 'error') {
        console.log(ticket);

        if (
          ticket.details?.error === 'DeviceNotRegistered' ||
          ticket.details?.error === 'InvalidCredentials'
        ) {
          await this.markTokenAsInvalid(messages[i].to as string);
        }
      }
    }
    console.log('Push notifications sent with tickets:', tickets);
  }

  private async markTokenAsInvalid(token: string): Promise<void> {
    await this.pushTokenRepository.update({ token }, { isActive: false });
    console.log('Push notifications sent with tickets:', token);
  }
}
