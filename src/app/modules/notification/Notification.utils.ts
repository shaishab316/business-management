import firebase from 'firebase-admin';
import prisma from '../../../util/prisma';

export const sendPushNotification = async ({
  fcmTokens,
  title,
  body,
}: {
  fcmTokens: string[];
  title: string;
  body: string;
}): Promise<boolean> => {
  try {
    await firebase.messaging().sendEachForMulticast({
      tokens: fcmTokens,

      notification: {
        title: title,
        body: body,
      },

      apns: {
        headers: {
          'apns-push-type': 'alert',
        },
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    });

    return true;
  } catch (error: any) {
    if (error?.code === 'messaging/third-party-auth-error') {
      return true;
    } else {
      return false;
    }
  }
};

export const sendUserPostNotification = async ({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}): Promise<boolean> => {
  const fcmTokens = (
    await prisma.user.findMany({
      where: {
        id: userId,
        fcmToken: { not: null },
      },
      select: { fcmToken: true },
    })
  ).map(({ fcmToken }) => fcmToken!);

  return sendPushNotification({ fcmTokens, title, body });
};
