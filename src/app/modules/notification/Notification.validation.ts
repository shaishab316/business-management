import { z } from 'zod';
import { exists } from '../../../util/db/exists';
import { ENotificationType } from '../../../../prisma';
import { _enum } from '../../../util/transform/enum';
import { rmNull } from '../../../util/transform/filterBoolean';
import { date } from '../../../util/transform/date';

export const NotificationValidations = {
  send: z.object({
    body: z.object({
      influencerIds: z
        .array(z.string().refine(exists('user')))
        .transform(rmNull)
        .default([]),
      campaignIds: z
        .array(z.string().refine(exists('campaign')))
        .transform(rmNull)
        .default([]),
      title: z
        .string({
          required_error: 'Title is missing',
        })
        .trim()
        .min(1, "Title can't be empty"),
      body: z
        .string({
          required_error: 'Body is missing',
        })
        .trim()
        .min(1, "Body can't be empty"),
      type: z
        .string()
        .transform(_enum)
        .optional()
        .pipe(z.nativeEnum(ENotificationType).optional()),
      scheduledAt: z.string().optional().transform(date),
    }),
  }),
};

export type TNotificationSend = z.infer<
  typeof NotificationValidations.send
>['body'];
