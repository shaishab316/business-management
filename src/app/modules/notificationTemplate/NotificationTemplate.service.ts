import {
  ENotificationType,
  NotificationTemplate as TNotificationTemplate,
} from '../../../../prisma';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';

export const NotificationTemplateServices = {
  async create(notificationTemplateData: TNotificationTemplate) {
    return prisma.notificationTemplate.create({
      data: notificationTemplateData,
    });
  },

  async update(
    notificationTemplateId: string,
    notificationTemplateData: TNotificationTemplate,
  ) {
    return prisma.notificationTemplate.update({
      where: { id: notificationTemplateId },
      data: notificationTemplateData,
    });
  },

  async delete(notificationTemplateId: string) {
    return prisma.notificationTemplate.delete({
      where: { id: notificationTemplateId },
    });
  },

  async getAll({ page, limit, type }: { type: ENotificationType } & TList) {
    const where = type ? { type } : {};

    const notificationTemplates = await prisma.notificationTemplate.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.notificationTemplate.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
      },
      notificationTemplates,
    };
  },

  async getById(notificationTemplateId: string) {
    return prisma.notificationTemplate.findUniqueOrThrow({
      where: { id: notificationTemplateId },
    });
  },
};
