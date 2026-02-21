import {
  Controller,
  Post,
  Body,
  Delete,
  UseGuards,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import RequestWithFirebaseUser from '../firebase-auth/interfaces/request-with-firebase-user.interface';
import { FirebaseAuthGuard } from '../firebase-auth/guards/firebase-auth.guard';
import { NotificationService } from './notifications.service';
import { SavePushTokenDto } from './dto/save-push-token.dto';
import { UserTokensResponseDto } from './dto/user-token.dto';
import { PaginatedList } from '../dto/paginated-list.dto';
import { NotificationResponseDto } from './dto/notifications.dto';
import { num } from '../utils/utils';
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async getNotifications(
    @Req() request: RequestWithFirebaseUser,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ): Promise<PaginatedList<NotificationResponseDto>> {
    const { user } = request;
    return await this.notificationService.getUserNotifications(
      user.id,
      num(page),
      num(pageSize),
    );
  }

  @Post('token')
  @UseGuards(FirebaseAuthGuard)
  async savePushToken(
    @Req() request: RequestWithFirebaseUser,
    @Body() dto: SavePushTokenDto,
  ): Promise<boolean> {
    const { user } = request;
    const res = await this.notificationService.savePushToken(user.id, dto);
    return res;
  }

  @Delete('token')
  async removePushToken(
    @Req() request: RequestWithFirebaseUser,
    @Query('deviceId') deviceId: string,
  ): Promise<boolean> {
    const { user } = request;
    if (!user) {
      throw new Error('Unauthenticated request');
    }

    const res = await this.notificationService.removePushToken(
      user.id,
      deviceId,
    );
    return res;
  }

  @Delete('tokens/all')
  async removeAllPushTokens(
    @Req() request: RequestWithFirebaseUser,
  ): Promise<boolean> {
    const { user } = request;
    return await this.notificationService.removeAllPushTokens(user.id);
  }

  @Get('tokens')
  async getUserTokens(
    @Req() request: RequestWithFirebaseUser,
  ): Promise<UserTokensResponseDto> {
    const { user } = request;
    const tokens = await this.notificationService.getUserPushTokens(user.id);
    return {
      tokens: tokens.map((t) => ({
        id: t.id,
        deviceId: t.deviceId,
        deviceType: t.deviceType,
        deviceName: t.deviceName,
        lastUsedAt: t.lastUsedAt,
      })),
    };
  }

  @Post('test')
  async sendTestNotification(
    @Req() request: RequestWithFirebaseUser,
  ): Promise<boolean> {
    const { user } = request;
    return await this.notificationService.sendNotificationToUser(
      user.id,
      'Test Notification',
      'This is a test notification from Genesis Mobile!',
      { type: 'test' },
    );
  }
}
