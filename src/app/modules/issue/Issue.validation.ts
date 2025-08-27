import { z } from 'zod';

export const IssueValidations = {
  create: z.object({
    body: z.object({
      content: z
        .string({
          required_error: 'Content is missing',
        })
        .min(1, 'Give a valid content'),
    }),
  }),
};
