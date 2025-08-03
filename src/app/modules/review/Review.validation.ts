import { z } from 'zod';
import { exists } from '../../../util/db/exists';

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

  getAll: z.object({
    query: z.object({
      talentId: z.string().trim().optional().refine(exists('user')),
      userId: z.string().trim().optional().refine(exists('user')),
      campaignId: z.string().trim().optional().refine(exists('campaign')),
    }),
  }),
};
