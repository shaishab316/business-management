import { Issue as TIssue } from '../../../../prisma';
import prisma from '../../../util/prisma';

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
};
