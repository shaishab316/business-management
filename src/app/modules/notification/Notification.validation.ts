import { z } from 'zod';
import { exists } from '../../../util/db/exists';
import { date } from '../../../util/transform/date';
import { NotificationTemplateValidations } from '../notificationTemplate/NotificationTemplate.validation';
import { enum_encode } from '../../../util/transform/enum';
import { ENotificationStatus } from '../../../../prisma';

export const NotificationValidations = {
  send: z.object({
    body: z.object({
      influencerId: z.string().refine(exists('user'), influencerId => ({
        message: 'Influencer not found with id: ' + influencerId,
        path: ['influencerIds'],
      })),
      scheduledAt: z
        .string()
        .optional()
        .transform(date)
        .refine(scheduledAt => scheduledAt! > new Date(), {
          message: 'Scheduled date must be in the future',
          path: ['scheduledAt'],
        })
        .optional(),
    }),
  }),

  getAll: z.object({
    query: z.object({
      status: z
        .string()
        .optional()
        .transform(enum_encode)
        .pipe(z.nativeEnum(ENotificationStatus).optional()),
    }),
  }),
};

export type TNotificationSend = z.infer<
  typeof NotificationValidations.send &
    typeof NotificationTemplateValidations.create
>['body'];
