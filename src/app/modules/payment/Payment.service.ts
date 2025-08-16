import { StatusCodes } from 'http-status-codes';
import { EPaymentStatus, Payment as TPayment } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';

export const PaymentServices = {
  async create(paymentData: TPayment) {
    const task = await prisma.task.findUnique({
      where: { id: paymentData.taskId },
      select: {
        campaign: {
          select: {
            budget: true,
          },
        },
        influencer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (task?.influencer.id !== paymentData.influencerId)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You cannot request payment for ${task?.influencer?.name}'s task.`,
      );

    paymentData.amount = task!.campaign.budget;

    return prisma.payment.create({ data: paymentData });
  },

  async changeStatus(paymentId: string, status: EPaymentStatus) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
  },
};
