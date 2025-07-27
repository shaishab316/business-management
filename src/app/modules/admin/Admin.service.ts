import colors from 'colors';
import { errorLogger } from '../../../util/logger/logger';
import { logger } from '../../../util/logger/logger';
import config from '../../../config';
import { UserServices } from '../user/User.service';
import { EUserRole } from '../user/User.interface';
import prisma from '../../../util/prisma';

export const AdminServices = {
  /**
   * Seeds the admin user if it doesn't exist in the database
   *
   * This function checks if an admin user already exists in the database.
   * If an admin user exists, it returns without creating a new one.
   * Otherwise, it creates a new admin user with the provided admin data.
   */
  async seed() {
    const adminData = config.admin;

    try {
      const admin = await prisma.user.findFirst({
        where: { email: adminData.email },
      });

      if (admin) return;

      logger.info(colors.green('🔑 admin creation started...'));

      await UserServices.create({
        ...adminData,
        role: EUserRole.ADMIN,
      } as any);

      logger.info(colors.green('✔ admin created successfully!'));
    } catch (error) {
      errorLogger.error(colors.red('❌ admin creation failed!'), error);
    }
  },
};
