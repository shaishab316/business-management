import z from 'zod';
import { ManagerInfluencerValidations } from './ManagerInfluencer.validation';

export type TConnectManagerArgs = z.infer<
  typeof ManagerInfluencerValidations.connectManager
>['body'] & {
  influencerId: string;
};

export type TConnectInfluencerArgs = z.infer<
  typeof ManagerInfluencerValidations.connectInfluencer
>['body'] & {
  managerId: string;
};

export type TDisconnectManagerInfluencerArgs = z.infer<
  typeof ManagerInfluencerValidations.disconnectInfluencer
>['body'] &
  z.infer<typeof ManagerInfluencerValidations.disconnectManager>['body'];
