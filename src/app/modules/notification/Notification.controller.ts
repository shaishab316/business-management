import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { NotificationServices } from './Notification.service';
import { ENotificationStatus } from '../../../../prisma';
import config from '../../../config';

export const NotificationControllers = {
  send: catchAsync(async ({ body }, res) => {
    const data = await NotificationServices.send(body);

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: 'Notification send successfully!',
      data,
    });
  }),

  getAll: catchAsync(async ({ query, user }, res) => {
    const { meta, notifications } = await NotificationServices.getAll({
      ...query,
      recipientId: user.id,
      status: {
        not: ENotificationStatus.PENDING,
      },
    });

    serveResponse(res, {
      message: 'Notifications retrieved successfully!',
      meta,
      data: notifications.map(notification => ({
        ...notification,
        recipientIds: undefined,
      })),
    });
  }),

  getScheduled: catchAsync(async ({ query }, res) => {
    const { meta, notifications } = await NotificationServices.getAll({
      ...query,
      include: {
        recipient: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      status: ENotificationStatus.PENDING,
    });

    serveResponse(res, {
      message: 'Notifications retrieved successfully!',
      meta,
      data: notifications.map(({ recipient, ...notification }: any) => ({
        ...notification,
        recipientName: recipient?.name ?? 'Unknown',
        recipientAvatar: recipient?.avatar ?? config.server.default_avatar,
      })),
    });
  }),

  getSent: catchAsync(async ({ query }, res) => {
    const { meta, notifications } = await NotificationServices.getAll({
      ...query,
      include: {
        recipient: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      status: ENotificationStatus.READ,
    });

    serveResponse(res, {
      message: 'Notifications retrieved successfully!',
      meta,
      data: notifications.map(({ recipient, ...notification }: any) => ({
        ...notification,
        recipientName: recipient?.name ?? 'Unknown',
        recipientAvatar: recipient?.avatar ?? config.server.default_avatar,
      })),
    });
  }),

  readNotification: catchAsync(async ({ params }, res) => {
    const data = await NotificationServices.readNotification(
      params.notificationId,
    );

    serveResponse(res, {
      message: 'Notification read successfully!',
      data,
    });
  }),

  readAllNotifications: catchAsync(async ({ user }, res) => {
    const data = await NotificationServices.readAllNotifications(user.id);

    serveResponse(res, {
      message: 'All notifications read successfully!',
      data,
    });
  }),
};
