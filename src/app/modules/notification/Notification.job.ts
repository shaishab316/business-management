/* eslint-disable no-console */
import cron from 'node-cron';
import prisma from '../../../util/prisma';
import { ENotificationStatus } from '../../../../prisma';
import colors from 'colors';
import { sendUserPostNotification } from './Notification.utils';
import { twilioCall } from '../../../lib/twilio/twilioCall';

const fiveDays = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

export const NotificationJobs = {
  init() {
    // Run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
      console.log(colors.yellow('Running notification job at 10:00 AM'));

      try {
        // Get all pending notifications
        const notifications = await prisma.notification.findMany({
          where: {
            status: ENotificationStatus.PENDING,
          },
          select: {
            id: true,
            title: true,
            body: true,
            scheduledAt: true,
            recipientId: true,
            recipient: {
              select: {
                name: true,
                phone: true,
                id: true,
              },
            },
          },
        });

        // Process notifications
        for (const notification of notifications) {
          // Send push notification if scheduled time has passed
          if (
            notification.scheduledAt &&
            notification.scheduledAt <= new Date()
          ) {
            const done = await sendUserPostNotification({
              userId: notification.recipientId,
              title: notification.title,
              body: notification.body,
            });

            if (done) {
              await prisma.notification.update({
                where: { id: notification.id },
                data: {
                  status: ENotificationStatus.PUSHED,
                  scheduledAt: null,
                },
              });
            }
          }
          // Make call reminder if older than 5 days
          else if (
            notification.scheduledAt &&
            notification.scheduledAt < fiveDays &&
            notification.recipient.phone
          ) {
            await twilioCall({
              to: notification.recipient.phone,
              message: `Hello ${notification.recipient.name}, ${notification.title} ${notification.body}`,
              userId: notification.recipient.id,
            });
          }
        }

        console.log(`Processed ${notifications.length} notifications`);
      } catch (error) {
        console.error('Failed to process notifications:', error);
      }
    });

    console.log(
      colors.yellow('Notification job scheduled to run daily at 10:00 AM'),
    );
  },
};
