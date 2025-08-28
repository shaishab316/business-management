/* eslint-disable no-console */
import ms from 'ms';
import config from '../../../config';
import prisma from '../../../util/prisma';
import { ENotificationStatus } from '../../../../prisma';
import colors from 'colors';
import { sendUserPostNotification } from './Notification.utils';

const time = ms(config.notification_interval);

export const NotificationJobs = {
  publishing() {
    console.log(
      colors.yellow(
        'Notification publishing job started. Interval: ' +
          ms(time, { long: true }),
      ),
    );

    (async function publish() {
      try {
        const notifications = await prisma.notification.findMany({
          where: {
            status: ENotificationStatus.PENDING,
            scheduledAt: { lte: new Date() },
          },
        });

        for (const notification of notifications) {
          const done = await sendUserPostNotification({
            userId: notification.recipientId,
            title: notification.title,
            body: notification.body,
          });

          if (done) {
            await prisma.notification.update({
              where: { id: notification.id },
              data: {
                status: done
                  ? ENotificationStatus.PUSHED
                  : ENotificationStatus.UNREAD,
                scheduledAt: null,
              },
            });
          }
        }

        console.log(`Published ${notifications.length} notifications`);
      } catch (error) {
        console.error('Failed to publish notifications:', error);
      } finally {
        setTimeout(publish, time);
      }
    })();
  },
};
