import z from 'zod';
import { ManagerInfluencerValidations } from './ManagerInfluencer.validation';
import { User as TUser } from '../../../../prisma';
import { TList } from '../query/Query.interface';

export type TConnectManagerArgs = z.infer<
  typeof ManagerInfluencerValidations.connectManager
>['body'] & {
  influencer: TUser;
};

export type TConnectInfluencerArgs = z.infer<
  typeof ManagerInfluencerValidations.connectInfluencer
>['body'] & {
  manager: TUser;
};

export type TDisconnectManagerInfluencerArgs = z.infer<
  typeof ManagerInfluencerValidations.disconnectInfluencer
>['body'] &
  z.infer<typeof ManagerInfluencerValidations.disconnectManager>['body'];

export type TGetInfluencersInfoArgs = TList & { managerId: string } & z.infer<
    typeof ManagerInfluencerValidations.getInfluencersInfo
  >['query'];
