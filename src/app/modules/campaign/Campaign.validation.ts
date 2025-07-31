import { z } from 'zod';
import { json } from '../../../util/transform/json';
import { date } from '../../../util/transform/date';

export const CampaignValidations = {
  create: z.object({
    body: z.object({
      title: z
        .string({
          required_error: 'Title is missing',
        })
        .trim()
        .min(1, "Title can't be empty"),
      brand: z
        .string({
          required_error: 'Brand is missing',
        })
        .trim()
        .min(1, "Brand can't be empty"),
      banner: z.string({
        required_error: 'Banner is missing',
      }),
      campaign_type: z
        .string({
          required_error: 'Campaign type is missing',
        })
        .trim()
        .min(1, "Campaign type can't be empty"),
      budget: z.coerce.number({
        required_error: 'Budget is missing',
      }),
      duration: z
        .string({
          required_error: 'Duration is missing',
        })
        .trim()
        .transform(date)
        .pipe(z.date()),
      content_type: z
        .string({
          required_error: 'Content type is missing',
        })
        .trim()
        .min(1, "Content type can't be empty"),
      payout_deadline: z
        .string({
          required_error: 'Payout deadline is missing',
        })
        .trim()
        .min(1, "Payout deadline can't be empty"),
      expected_metrics: z
        .string()
        .optional()
        .transform(json)
        .pipe(
          z
            .record(
              z.string(),
              z.string({
                required_error: 'Metric is missing',
              }),
            )
            .optional(),
        ),
      other_fields: z
        .string()
        .optional()
        .transform(json)
        .pipe(
          z
            .record(
              z.string(),
              z.string({
                required_error: 'Field is missing',
              }),
            )
            .optional(),
        ),
    }),
  }),

  edit: z.object({
    body: z.object({
      title: z.string().trim().optional(),
      brand: z.string().trim().optional(),
      banner: z.string().trim().optional(),
      campaign_type: z.string().trim().optional(),
      budget: z.coerce.number().optional(),
      duration: z.string().trim().optional().transform(date).pipe(z.date()),
      content_type: z.string().trim().optional(),
      payout_deadline: z.string().trim().optional(),
      expected_metrics: z
        .string()
        .optional()
        .transform(json)
        .pipe(
          z
            .record(
              z.string(),
              z.string({
                required_error: 'Metric is missing',
              }),
            )
            .optional(),
        ),
      other_fields: z
        .string()
        .optional()
        .transform(json)
        .pipe(
          z
            .record(
              z.string(),
              z.string({
                required_error: 'Field is missing',
              }),
            )
            .optional(),
        ),
    }),
  }),
};
