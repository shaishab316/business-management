import { z } from 'zod';

export const ReviewValidations = {
  giveReview: z.object({
    body: z.record(
      z
        .string({
          required_error: 'Rating field name is missing',
        })
        .trim()
        .min(1, "Rating field name can't be empty"),
      z.coerce
        .number({
          required_error: 'Rating field value is missing',
        })
        .min(1, 'Rating must be between 1 and 5')
        .max(5, 'Rating must be between 1 and 5'),
    ),
  }),
};
