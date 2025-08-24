'use strict';

import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TNotificationSend } from './Notification.validation';
import { ENotificationStatus } from '../../../../prisma';
import { TList } from '../query/Query.interface';
import { TPagination } from '../../../util/server/serveResponse';
import { sendUserPostNotification } from './Notification.utils';

export const NotificationServices = {
  async send({
    influencerIds,
    campaignIds,
    type,
    scheduledAt,
    title,
    body,
  }: TNotificationSend) {
    let status: ENotificationStatus = scheduledAt
      ? ENotificationStatus.PENDING
      : ENotificationStatus.UNREAD;

    const recipientSet = new Set<string>(influencerIds);
    const failedRecipientSet = new Set<string>();

    if (campaignIds.length) {
      const tasks = await prisma.task.findMany({
        where: {
          campaignId: { in: campaignIds },
        },
        select: { influencerId: true },
      });

      tasks.forEach(({ influencerId }) => recipientSet.add(influencerId));
    }

    const compromises = await prisma.compromise.findMany({
      where: {
        influencerId: { in: Array.from(recipientSet) },
        date: { gte: new Date() },
      },
      select: {
        influencerId: true,
      },
    });

    for (const { influencerId } of compromises)
      influencerId?.__pipes(
        id => recipientSet.delete(id),
        id => failedRecipientSet.add(id),
      );

    if (!recipientSet.size)
      if (failedRecipientSet.size)
        throw new ServerError(
          StatusCodes.BAD_REQUEST,
          'Influencer has compromises.',
        );
      else
        throw new ServerError(
          StatusCodes.NOT_FOUND,
          'Pleases select influencer or campaign.',
        );

    if (!scheduledAt) {
      const done = await sendUserPostNotification({
        userIds: Array.from(recipientSet),
        title,
        body,
      });

      if (done) status = ENotificationStatus.PUSHED;
    }

    await prisma.notification.create({
      data: {
        title,
        body,
        scheduledAt,
        type,
        status,
        recipientIds: Array.from(recipientSet),
      },
    });

    return {
      successRecipients: Array.from(recipientSet),
      failedRecipients: Array.from(failedRecipientSet),
    };
  },

  async getAll({ page, limit, ...where }: TList) {
    where.status = {
      not: ENotificationStatus.PENDING,
    };

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
        `${notification?.status?.toCapitalize()} notification cannot be read`,
      );

    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: ENotificationStatus.READ },
    });
  },

  async readAllNotifications(influencerId: string) {
    await prisma.notification.updateMany({
      where: {
        recipientIds: { has: influencerId },
        status: ENotificationStatus.UNREAD,
      },
      data: { status: ENotificationStatus.READ },
    });
  },
};
