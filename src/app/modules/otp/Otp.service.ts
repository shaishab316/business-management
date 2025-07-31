import ms from 'ms';
import config from '../../../config';
import { sendEmail } from '../../../util/sendMail';
import { OtpTemplates } from './Otp.template';
import { otpGenerator } from '../../../util/crypto/otpGenerator';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { TList } from '../query/Query.interface';
import { User as TUser } from '../../../../prisma';
import prisma from '../../../util/prisma';
import { TPagination } from '../../../util/server/serveResponse';

export const OtpServices = {
  async send(user: TUser, type: 'resetPassword' | 'accountVerify') {
    const otp = otpGenerator(config.otp.length);

    if (type === 'resetPassword')
      sendEmail({
        to: user.email,
        subject: `Your ${config.server.name} password reset OTP is ⚡ ${otp} ⚡.`,
        html: OtpTemplates.reset({
          userName: user?.name ?? 'Mr. ' + user.role,
          otp,
        }),
      });
    else if (type === 'accountVerify')
      sendEmail({
        to: user.email,
        subject: `Your ${config.server.name} account verification OTP is ⚡ ${otp} ⚡.`,
        html: OtpTemplates.welcome({
          userName: user?.name ?? 'Mr. ' + user.role,
          otp,
        }),
      });

    return prisma.otp.upsert({
      where: { userId: user.id },
      update: { code: otp, exp: new Date(Date.now() + ms(config.otp.exp)) },
      create: {
        userId: user.id,
        code: otp,
        exp: new Date(Date.now() + ms(config.otp.exp)),
      },
    });
  },

  async verify(userId: string, code: string) {
    /** Delete expired otp */
    await prisma.otp.deleteMany({
      where: { exp: { lt: new Date() } },
    });

    const validOtp = await prisma.otp.findFirst({
      where: { userId, code, exp: { gt: new Date() } },
    });

    if (!validOtp)
      throw new ServerError(
        StatusCodes.UNAUTHORIZED,
        'Your credentials are incorrect.',
      );

    return prisma.otp.delete({ where: { id: validOtp.id } });
  },

  async list({ page, limit, email }: TList & { email: string }) {
    //! only for development
    if (!config.server.isDevelopment)
      throw new ServerError(
        StatusCodes.UNAVAILABLE_FOR_LEGAL_REASONS,
        'Service not available.',
      );

    const filter: { userId?: string } = {};

    if (email) {
      const user = await prisma.user.findFirst({ where: { email } });

      if (!user)
        throw new ServerError(StatusCodes.NOT_FOUND, 'User not found!');

      filter.userId = user.id;
    }

    const otps = await prisma.otp.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.otp.count({ where: filter });

    return {
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        } as TPagination,
        query: {
          email,
        },
      },
      otps,
    };
  },
};
