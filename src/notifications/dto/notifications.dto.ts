import {
  Notification,
  NotificationType,
} from '../../entities/notifications.entity';

export class NotificationResponseDto {
  id: string;
  userId: string;
  notificationType: NotificationType;
  title: string;
  body: string;
  data: any;
  createdAt: Date;
}

export const parseNotificationEntityToDto = (
  notificationEntitiy: Notification,
): NotificationResponseDto => {
  const dto = new NotificationResponseDto();
  dto.id = notificationEntitiy.id;
  dto.userId = notificationEntitiy.userId;
  dto.notificationType = notificationEntitiy.notificationType;
  dto.title = notificationEntitiy.title;
  dto.body = notificationEntitiy.body;
  dto.data = notificationEntitiy.data;
  dto.createdAt = notificationEntitiy.createdAt;
  return dto;
};
