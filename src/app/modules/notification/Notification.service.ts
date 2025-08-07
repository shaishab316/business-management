import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TNotificationSend } from './Notification.validation';
import { ENotificationStatus } from '../../../../prisma';

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

    return prisma.notification.create({
      data: {
        ...rest,
        scheduledAt,
        type,
        status,
        recipientIds: Array.from(recipientSet),
      },
    });
  },
};
