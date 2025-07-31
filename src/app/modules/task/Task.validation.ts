import { z } from 'zod';
import { exists } from '../../../util/db/exists';
import { ETaskStatus } from '../../../../prisma';
import { upper } from '../../../util/transform/upper';

export const TaskValidations = {
  create: z.object({
    body: z.object({
      talentAgreementProof: z.string({
        required_error: 'Talent agreement proof is missing',
      }),
    }),
  }),

  superGetAll: z.object({
    query: z.object({
      talentId: z.string().optional().refine(exists('user')),
    }),
  }),

  updateStatus: z.object({
    params: z.object({
      status: z.string().transform(upper).pipe(z.nativeEnum(ETaskStatus)),
    }),
  }),

  submitPostLink: z.object({
    body: z.object({
      postLink: z
        .string({
          required_error: 'Post link is missing',
        })
        .url('Give a valid post link'),
    }),
  }),
};
