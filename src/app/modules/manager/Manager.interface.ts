import z from 'zod';
import { ManagerValidations } from './Manager.validation';

export type TManagerSubmitPostLinkArgs = z.infer<
  typeof ManagerValidations.submitPostLink
>['body'] & { managerId: string };
