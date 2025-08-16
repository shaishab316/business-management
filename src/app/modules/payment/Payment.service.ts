import { Payment as TPayment } from '../../../../prisma';
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
      },
    });

    paymentData.amount = task!.campaign.budget;

    return prisma.payment.create({ data: paymentData });
  },
};
