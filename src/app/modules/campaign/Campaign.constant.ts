import { Campaign as TCampaign } from '../../../../prisma';

export const campaignSearchableFields: (keyof TCampaign)[] = [
  'title',
  'description',
  'brand',
  'campaign_type',
];
