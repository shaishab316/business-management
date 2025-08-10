/* eslint-disable no-console */
import ms from 'ms';
import config from '../../../config';
import prisma from '../../../util/prisma';
import { ENotificationStatus } from '../../../../prisma';
import colors from 'colors';

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
        const { count } = await prisma.notification.updateMany({
          where: {
            status: ENotificationStatus.PENDING,
            scheduledAt: { lte: new Date() },
          },

          data: {
            status: ENotificationStatus.UNREAD,
            scheduledAt: null,
          },
        });

        console.log(`Published ${count} notifications`);
      } catch (error) {
        console.error('Failed to publish notifications:', error);
      } finally {
        setTimeout(publish, time);
      }
    })();
  },
};
