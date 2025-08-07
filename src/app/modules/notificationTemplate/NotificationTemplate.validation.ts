import { z } from 'zod';
import { _enum } from '../../../util/transform/enum';
import { ENotificationType } from '../../../../prisma';

const type = z
  .string()
  .transform(_enum)
  .optional()
  .pipe(z.nativeEnum(ENotificationType).optional());

export const NotificationTemplateValidations = {
  create: z.object({
    body: z.object({
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
      type,
    }),
  }),

  update: z.object({
    body: z.object({
      title: z.string().trim().optional(),
      body: z.string().trim().optional(),
      type,
    }),
  }),

  getAll: z.object({
    query: z.object({
      type,
    }),
  }),
};
