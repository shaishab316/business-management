import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { IssueServices } from './Issue.service';

export const IssueControllers = {
  create: catchAsync(async ({ params, body, user }, res) => {
    const data = await IssueServices.create({
      campaignId: params.campaignId,
      influencerId: user.id,
      content: body.content,
    });

    serveResponse(res, {
      message: 'Issue created successfully!',
      data,
    });
  }),

  markAsRead: catchAsync(async ({ params }, res) => {
    await IssueServices.markAsRead(params.issueId);

    serveResponse(res, {
      message: 'Issue marked as read successfully!',
    });
  }),
};
