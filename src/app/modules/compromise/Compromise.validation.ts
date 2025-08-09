import { z } from 'zod';
import { date } from '../../../util/transform/date';

export const CompromiseValidations = {
  create: z.object({
    body: z.object({
      date: z
        .string({
          required_error: 'Date is missing',
        })
        .trim()
        .transform(date),
    }),
  }),
};
