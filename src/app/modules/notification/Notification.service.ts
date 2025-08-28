import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TNotificationSend } from './Notification.validation';
import {
  ENotificationStatus,
  ENotificationType,
  Prisma,
} from '../../../../prisma';
import { TList } from '../query/Query.interface';
import { TPagination } from '../../../util/server/serveResponse';
import { sendUserPostNotification } from './Notification.utils';

export const NotificationServices = {
  async send({
    influencerId,
    scheduledAt,
    type,
    title,
    body,
  }: TNotificationSend) {
    let status: ENotificationStatus = scheduledAt
      ? ENotificationStatus.PENDING
      : ENotificationStatus.UNREAD;

    const compromises = await prisma.compromise.findFirst({
      where: {
        influencerId,
        date: { gte: new Date() },
      },
      select: {
        id: true,
      },
    });

    if (compromises)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        'Influencer has compromises.',
      );

    if (!scheduledAt) {
      const done = await sendUserPostNotification({
        userId: influencerId,
        title,
        body,
      });

      if (done) status = ENotificationStatus.PUSHED;
    }

    return prisma.notification.create({
      data: {
        title,
        body,
        scheduledAt,
        type,
        status,
        recipientId: influencerId,
      },
    });
  },

  async getAll({
    page,
    limit,
    include,
    ...where
  }: TList & {
    include?: Prisma.NotificationInclude;
  } & Prisma.NotificationWhereInput) {
    const notifications = await prisma.notification.findMany({
      where,
      include,
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
        `${notification?.status?.toCapitalize()} notification cannot be read`,
      );

    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: ENotificationStatus.READ },
    });
  },

  async readAllNotifications(recipientId: string) {
    return prisma.notification.updateMany({
      where: {
        recipientId,
        type: ENotificationType.SOFT,
        status: ENotificationStatus.UNREAD,
      },
      data: { status: ENotificationStatus.READ },
    });
  },
};
