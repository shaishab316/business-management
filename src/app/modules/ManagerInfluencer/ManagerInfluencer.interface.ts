import z from 'zod';
import { ManagerInfluencerValidations } from './ManagerInfluencer.validation';

export type TInviteManagerArgs = z.infer<
  typeof ManagerInfluencerValidations.inviteManager
>['body'] & {
  influencerId: string;
};

export type TInviteInfluencerArgs = z.infer<
  typeof ManagerInfluencerValidations.inviteInfluencer
>['body'] & {
  managerId: string;
};

export type TDisconnectManagerInfluencerArgs = z.infer<
  typeof ManagerInfluencerValidations.disconnectInfluencer
>['body'] &
  z.infer<typeof ManagerInfluencerValidations.disconnectManager>['body'];
