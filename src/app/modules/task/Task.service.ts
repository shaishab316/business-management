import { StatusCodes } from 'http-status-codes';
import { ETaskStatus, Prisma, Task as TTask } from '../../../../prisma';
import ServerError from '../../../errors/ServerError';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';
import { TList } from '../query/Query.interface';
import { deleteFile } from '../../middlewares/capture';

export const TaskServices = {
  async getTask(
    where: Pick<Prisma.TaskWhereInput, 'influencerId' | 'campaignId'>,
  ) {
    const task = await prisma.task.findFirst({
      where,
    });

    if (!task)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Campaign not found.');

    return task;
  },

  async createTask(taskData: TTask) {
    const existsTask = await prisma.task.findFirst({
      where: {
        campaignId: taskData.campaignId,
        influencerId: taskData.influencerId,
        status: ETaskStatus.PENDING,
      },
      include: {
        influencer: true,
        campaign: true,
      },
    });

    if (existsTask)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `${existsTask.influencer?.name} is already assigned to this campaign`,
      );

    const campaign = (await prisma.campaign.findUnique({
      where: { id: taskData.campaignId },
      select: { duration: true, budget: true },
    }))!;

    taskData.duration = campaign.duration;
    taskData.budget = campaign.budget;

    return prisma.task.create({
      data: taskData as any,
      include: {
        campaign: true,
        influencer: true,
      },
    });
  },

  async acceptTask({ id, influencerId, ...taskData }: TTask) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        influencer: true,
        campaign: true,
      },
    });

    if (task?.influencerId !== influencerId)
      throw new ServerError(
        StatusCodes.FORBIDDEN,
        `You cannot accept ${task?.influencer?.name}'s task.`,
      );

    if (task?.status !== ETaskStatus.PENDING)
      throw new ServerError(
        StatusCodes.BAD_REQUEST,
        `Campaign Task already ${task?.status?.toLocaleLowerCase()}.`,
      );

    return prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        status: ETaskStatus.ACTIVE,
      },
    });
  },

  async getAll({
    page,
    limit,
    influencerId,
    status,
  }: TList & { status?: ETaskStatus }) {
    const where: Prisma.TaskWhereInput = {};

    if (influencerId) where.influencerId = influencerId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        campaign: true,
        influencer: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.task.count({ where });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        query: where,
      },
      tasks,
    };
  },

  async updateStatus(taskId: string, status: ETaskStatus) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  },

  async submitPostLink(taskId: string, postLink: string) {
    return prisma.task.update({
      where: { id: taskId },
      data: { postLink, statusText: 'submitted' },
    });
  },

  async uploadMatrix(
    where: Pick<Prisma.TaskWhereInput, 'influencerId' | 'campaignId'>,
    { screenshot, ...matrix }: Record<string, string>,
  ) {
    const task = await prisma.task.findFirst({
      where,
      select: { id: true, screenshot: true },
    });

    if (!task)
      throw new ServerError(StatusCodes.NOT_FOUND, 'Campaign not found.');

    if (task.screenshot) {
      await deleteFile(task.screenshot);
    }

    return prisma.task.update({
      where: { id: task.id },
      data: {
        matrix,
        screenshot,
        statusText: 'submitted',
      },
    });
  },

  async analytics({
    page = 1,
    limit = 10,
    status,
  }: TList & { status: ETaskStatus }) {
    const pipeline = [
      { $match: { status } },
      { $project: { campaignId: 1, matrix: { $objectToArray: '$matrix' } } },
      { $unwind: '$matrix' },
      {
        $group: {
          _id: { campaignId: '$campaignId', key: '$matrix.k' },
          total: { $sum: { $ifNull: ['$matrix.v', 0] } },
        },
      },
      {
        $group: {
          _id: '$_id.campaignId',
          metrics: { $push: { k: '$_id.key', v: '$total' } },
        },
      },
      { $addFields: { metrics: { $arrayToObject: '$metrics' } } },
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: '_id',
          as: 'campaign',
        },
      },
      { $unwind: '$campaign' },
      {
        $addFields: {
          campaignId: { $toString: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          campaignId: 1,
          campaignName: '$campaign.title',
          campaignBanner: '$campaign.banner',
          tasks: { total: '$metrics' },
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const [campaigns, [totalData]] = await Promise.all([
      prisma.task.aggregateRaw({ pipeline }),
      prisma.task.aggregateRaw({
        pipeline: [
          { $match: { status } },
          { $group: { _id: '$campaignId' } },
          { $count: 'total' },
        ],
      }) as any,
    ]);

    const total = totalData?.[0]?.total ?? 0;

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        query: { status: status ?? null },
      },
      campaigns,
    };
  },
};
