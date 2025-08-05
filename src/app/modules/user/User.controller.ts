import { UserServices } from './User.service';
import catchAsync from '../../middlewares/catchAsync';
import serveResponse from '../../../util/server/serveResponse';
import { StatusCodes } from 'http-status-codes';
import { AuthServices } from '../auth/Auth.service';
import { OtpServices } from '../otp/Otp.service';
import { errorLogger } from '../../../util/logger/logger';
import { User as TUser } from '../../../../prisma';

export const UserControllers = {
  create: catchAsync(async ({ body }, res) => {
    const user = (await UserServices.create(body)) as TUser;
    let otp = null;

    try {
      otp = await OtpServices.send(user, 'accountVerify');
    } catch (error) {
      errorLogger.error(error);
    }

    const { access_token, refresh_token } = AuthServices.retrieveToken(
      user.id,
      'access_token',
      'refresh_token',
    );

    AuthServices.setTokens(res, { access_token, refresh_token });

    serveResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: `${user.role.toCapitalize() ?? 'User'} registered successfully!`,
      data: {
        access_token,
        user,
        otp: { expiredAt: otp?.exp?.toLocaleTimeString() },
      },
    });
  }),

  edit: catchAsync(async (req, res) => {
    const data = await UserServices.edit(req);

    serveResponse(res, {
      message: 'Profile updated successfully!',
      data,
    });
  }),

  getAllUser: catchAsync(async ({ query }, res) => {
    const { meta, users } = await UserServices.list(query);

    serveResponse(res, {
      message: 'Users retrieved successfully!',
      meta,
      data: users,
    });
  }),

  profile: catchAsync(({ user }, res) => {
    serveResponse(res, {
      message: 'Profile retrieved successfully!',
      data: user,
    });
  }),

  delete: catchAsync(async ({ params }, res) => {
    const user = await UserServices.delete(params.userId);

    serveResponse(res, {
      message: `${user?.name ?? 'User'} deleted successfully!`,
    });
  }),

  requestForInfluencer: catchAsync(async ({ body, user }, res) => {
    const { avatar, address, followers, link, platform } = body;

    const data = await UserServices.requestForInfluencer({
      id: user.id,
      avatar,
      address,
      socials: [
        {
          followers,
          link,
          platform,
        },
      ],
    });

    serveResponse(res, {
      message: 'Request sent successfully!',
      data,
    });
  }),

  getPendingInfluencers: catchAsync(async ({ query }, res) => {
    const { meta, influencers } =
      await UserServices.getPendingInfluencers(query);

    serveResponse(res, {
      message: 'Influencers retrieved successfully!',
      meta,
      data: influencers,
    });
  }),
};
