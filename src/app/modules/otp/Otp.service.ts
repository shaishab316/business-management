import ms from 'ms';
import config from '../../../config';
import { sendEmail } from '../../../util/sendMail';
import { OtpTemplates } from './Otp.template';
import { otpGenerator } from '../../../util/crypto/otpGenerator';
import ServerError from '../../../errors/ServerError';
import { StatusCodes } from 'http-status-codes';
import { User as TUser } from '../../../../prisma';
import prisma from '../../../util/prisma';

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
};
