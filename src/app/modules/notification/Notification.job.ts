/* eslint-disable no-console */
import ms from 'ms';
import config from '../../../config';
import prisma from '../../../util/prisma';
import { ENotificationStatus } from '../../../../prisma';
import colors from 'colors';
import { sendUserPostNotification } from './Notification.utils';
import { twilioCall } from '../../../lib/twilio/twilioCall';

const notificationIntervalTime = ms(config.notification_interval);
const fiveDays = ms('5d');
const twelveHours = ms('12h');

export const NotificationJobs = {
  init() {
    console.log(
      colors.yellow(
        'Notification publishing job started. Interval: ' +
          ms(notificationIntervalTime, { long: true }),
      ),
    );

    (async function publishing() {
      try {
        const notifications = await prisma.notification.findMany({
          where: {
            status: ENotificationStatus.PENDING,
            scheduledAt: { lte: new Date() },
          },
        });

        await Promise.allSettled(
          notifications.map(async notification => {
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
          }),
        );

        console.log(`Published ${notifications.length} notifications`);
      } catch (error) {
        console.error('Failed to publish notifications:', error);
      } finally {
        setTimeout(publishing, notificationIntervalTime);
      }
    })();

    console.log(
      colors.yellow(
        'Call reminder job started. Interval: ' +
          ms(twelveHours, { long: true }),
      ),
    );

    (async function callReminder() {
      try {
        const notifications = await prisma.notification.findMany({
          where: {
            status: ENotificationStatus.PENDING,
            scheduledAt: { lt: new Date(Date.now() - fiveDays) },
          },
          select: {
            title: true,
            body: true,
            recipient: {
              select: {
                name: true,
                phone: true,
                id: true,
              },
            },
          },
        });

        for (const { title, body, recipient } of notifications) {
          if (recipient.phone) {
            await twilioCall({
              to: recipient.phone,
              message: `Hello ${recipient.name}, ${title} ${body}`,
              userId: recipient.id,
            });
          }
        }
      } catch (error) {
        console.error('Failed to publish notifications:', error);
      } finally {
        setTimeout(callReminder, twelveHours);
      }
    })();
  },
};
