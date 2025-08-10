import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TNotificationSend } from './Notification.validation';
import { ENotificationStatus } from '../../../../prisma';
import { TList } from '../query/Query.interface';
import { TPagination } from '../../../util/server/serveResponse';

export const NotificationServices = {
  async send({
    influencerIds,
    campaignIds,
    type,
    scheduledAt,
    ...rest
  }: TNotificationSend) {
    let status: ENotificationStatus = ENotificationStatus.UNREAD;

    if (scheduledAt) {
      if (scheduledAt <= new Date())
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          'Scheduled date must be in the future',
        );

      status = ENotificationStatus.PENDING;
    }

    const recipientSet = new Set<string>(influencerIds);

    if (campaignIds.length) {
      const tasks = await prisma.task.findMany({
        where: {
          campaignId: { in: campaignIds },
        },
        select: { influencerId: true },
      });

      tasks.forEach(({ influencerId }) => recipientSet.add(influencerId));
    }

    if (!recipientSet.size)
      throw new ServerError(StatusCodes.BAD_REQUEST, 'No recipients found');

    await Promise.all(
      Array.from(recipientSet).map(influencerId =>
        prisma.notification.create({
          data: {
            ...rest,
            publishedAt: scheduledAt,
            type,
            status,
            influencerId,
          },
        }),
      ),
    );
  },

  async getAll({ page, limit, ...where }: TList) {
    where.publishedAt = { gte: new Date() };

    const notifications = await prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.notification.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      notifications,
    };
  },

  async readNotification(notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (notification?.status !== ENotificationStatus.UNREAD)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'Notification already read',
      );

    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: ENotificationStatus.READ },
    });
  },

  async readAllNotifications(influencerId: string) {
    await prisma.notification.updateMany({
      where: { influencerId, status: ENotificationStatus.UNREAD },
      data: { status: ENotificationStatus.READ },
    });
  },
};
