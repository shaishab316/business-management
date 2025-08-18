import { z } from 'zod';
import { enum_encode } from '../../../util/transform/enum';
import { EPaymentMethod, EPaymentStatus } from '../../../../prisma';
import { exists } from '../../../util/db/exists';

export const PaymentValidations = {
  create: z.object({
    query: z.object({
      method: z
        .string()
        .transform(enum_encode)
        .optional()
        .pipe(z.nativeEnum(EPaymentMethod).optional()),
    }),
  }),

  changeStatus: z.object({
    params: z.object({
      status: z
        .string()
        .transform(enum_encode)
        .pipe(z.nativeEnum(EPaymentStatus)),
    }),
  }),

  getAll: z.object({
    query: z.object({
      method: z
        .string()
        .transform(enum_encode)
        .optional()
        .pipe(z.nativeEnum(EPaymentMethod).optional()),
      status: z
        .string()
        .transform(enum_encode)
        .optional()
        .pipe(z.nativeEnum(EPaymentStatus).optional()),
      influencerId: z
        .string()
        .refine(exists('user'), id => ({
          message: 'Influencer not found with id: ' + id,
          path: ['influencerId'],
        }))
        .optional(),
    }),
  }),
};
