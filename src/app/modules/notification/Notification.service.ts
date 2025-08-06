import { StatusCodes } from 'http-status-codes';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TNotificationSend } from './Notification.validation';

export const NotificationServices = {
  async send({
    influencerIds,
    campaignIds,
    title,
    body,
    type,
  }: TNotificationSend) {
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
        title,
        body,
        type,
        recipientIds: Array.from(recipientSet),
      },
    });
  },
};
