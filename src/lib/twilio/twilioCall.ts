import { Twilio } from 'twilio';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { errorLogger, logger } from '../../util/logger/logger';
import colors from 'colors';
import config from '../../config';

const { account_sid, auth_token, number } = config.twilio;

const client = new Twilio(account_sid, auth_token);

export async function twilioCall({
  to,
  message,
  userId = undefined,
}: {
  to: string;
  message: string;
  userId?: string;
}) {
  try {
    const voiceResponse = new VoiceResponse();
    voiceResponse.say(message);
    voiceResponse.say('Thank you for using our service. Have a nice day.');
    voiceResponse.hangup(); // end the call immediately

    const call = await client.calls.create({
      twiml: voiceResponse.toString(),
      to,
      from: number,
    });

    logger.log(
      colors.green(
        `✅ twilioCall success ${userId ? ` TO USER_ID: ${userId}` : ''}`,
      ),
      call.sid,
    );
  } catch (error) {
    errorLogger.error(colors.red('❌ twilioCall failed'), error);
  }
}
