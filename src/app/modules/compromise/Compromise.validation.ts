import { z } from 'zod';
import { date } from '../../../util/transform/date';

export const CompromiseValidations = {
  compromise: z.object({
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
