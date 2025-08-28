import { Issue as TIssue } from '../../../../prisma';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';

export const IssueServices = {
  async create({
    campaignId,
    influencerId,
    content,
  }: Pick<TIssue, 'campaignId' | 'influencerId' | 'content'>) {
    let issue = await prisma.issue.findFirst({
      where: {
        campaignId,
        influencerId,
        unread: true,
      },
    });

    if (issue)
      await prisma.issue.update({
        where: {
          id: issue.id,
        },
        data: {
          content,
          unread: false,
        },
      });
    else
      issue = await prisma.issue.create({
        data: {
          campaignId,
          influencerId,
          content,
        },
      });

    return issue;
  },

  async markAsRead(issueId: string) {
    return prisma.issue.update({
      where: {
        id: issueId,
      },
      data: {
        unread: false,
      },
    });
  },

  async getIssuesByCampaignId({
    page,
    limit,
    campaignId,
  }: TList & { campaignId: string }) {
    const issues = await prisma.issue.findMany({
      where: {
        campaignId,
      },
      include: {
        influencer: {
          select: {
            name: true,
            rating: true,
            avatar: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.issue.count({ where: { campaignId } });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      issues: issues.map(({ influencer, id, content, unread }) => ({
        id,
        content,
        unread,
        influencerName: influencer.name,
        influencerRating: influencer.rating,
        influencerAvatar: influencer.avatar,
      })),
    };
  },
};
