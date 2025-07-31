import { z } from 'zod';
import { exists } from '../../../util/db/exists';

export const TaskValidations = {
  create: z.object({
    body: z.object({
      talent_agreement_proof: z.string({
        required_error: 'Talent agreement proof is missing',
      }),
    }),
  }),

  superGetAll: z.object({
    query: z.object({
      talentId: z.string().optional().refine(exists('user')),
    }),
  }),
};
