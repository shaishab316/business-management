import { z } from 'zod';
import { exists } from '../../../util/db/exists';

import { rmNull } from '../../../util/transform/filterBoolean';
import { date } from '../../../util/transform/date';
import { NotificationTemplateValidations } from '../notificationTemplate/NotificationTemplate.validation';

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
      scheduledAt: z.string().optional().transform(date),
    }),
  }),
};

export type TNotificationSend = z.infer<
  typeof NotificationValidations.send &
    typeof NotificationTemplateValidations.create
>['body'];
