import { z } from 'zod';
import { _enum } from '../../../util/transform/enum';
import { EPaymentMethod } from '../../../../prisma';

export const PaymentValidations = {
  create: z.object({
    query: z.object({
      method: z
        .string()
        .transform(_enum)
        .optional()
        .pipe(z.nativeEnum(EPaymentMethod).optional()),
    }),
  }),
};
