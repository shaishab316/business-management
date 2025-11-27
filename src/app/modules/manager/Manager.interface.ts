import z from 'zod';
import { ManagerValidations } from './Manager.validation';
import { TList } from '../query/Query.interface';

export type TManagerSubmitPostLinkArgs = z.infer<
  typeof ManagerValidations.submitPostLink
>['body'] & { managerId: string };

export type TManagerGetCampaignsArgs = z.infer<
  typeof ManagerValidations.getCampaigns
>['query'] &
  TList & {
    managerId: string;
  };

export type TManagerSendPaymentRequestArgs = z.infer<
  typeof ManagerValidations.sendPaymentRequest
>['body'] & { managerId: string };

export type TManagerGetPaymentsArgs = z.infer<
  typeof ManagerValidations.getPayments
>['query'] &
  TList & {
    managerId: string;
  };
