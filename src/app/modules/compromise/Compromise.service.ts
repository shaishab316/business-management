import { Compromise as TCompromise } from '../../../../prisma';
import prisma from '../../../util/prisma';

export const CompromiseServices = {
  async create(compromiseData: Partial<TCompromise>) {
    return prisma.compromise.create({ data: compromiseData as TCompromise });
  },
};
