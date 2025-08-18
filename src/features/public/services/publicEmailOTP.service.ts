import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import config from '../../../config/config';
import { IGetOTPPayload } from '../../../utils/interfaces/common/commonInterface';
import Lib from '../../../utils/lib/lib';
import {
  OTP_EMAIL_SUBJECT,
  OTP_FOR,
  OTP_TYPE_ADMIN_TRANSACTION,
  OTP_TYPE_FORGET_ADMIN,
  OTP_TYPE_FORGET_AGENT,
  OTP_TYPE_FORGET_USER,
  OTP_TYPE_TRANSACTION_VERIFY,
  OTP_TYPE_VERIFY_USER,
} from '../../../utils/miscellaneous/constants';
import ResMsg from '../../../utils/miscellaneous/responseMessage';
import { sendEmailOtpTemplate } from '../../../utils/templates/sendEmailOtp';
import { Knex } from 'knex';

class PublicEmailOTPService extends AbstractServices {
  private trx?: Knex.Transaction;
  constructor(trx?: Knex.Transaction) {
    super();
    this.trx = trx;
  }

  //send email otp service
  public async sendOtpToEmailService(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { email, type } = req.body as IGetOTPPayload;

      if (type === OTP_TYPE_FORGET_USER) {
        // --check if the user exist
        const userModel = this.Model.userModel();
        const checkuser = await userModel.getProfileDetails({ email });
        if (!checkuser.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'No user has been found with this email',
          };
        }
      } else if (type === OTP_TYPE_VERIFY_USER) {
        const userModel = this.Model.userModel();
        const checkUser = await userModel.getProfileDetails({ email });

        if (!checkUser.length || checkUser[0].is_verified) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'No unverified user found.',
          };
        }
      } else if (type === OTP_TYPE_FORGET_AGENT) {
        const agentModel = this.Model.agencyModel();
        const checkAgent = await agentModel.getSingleUser({ email });
        if (!checkAgent.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: 'No user found.',
          };
        }
      } else if (type === OTP_TYPE_TRANSACTION_VERIFY) {
        const model = this.Model.adminModel(trx);
        const admin_details = await model.getSingleAdmin({ email });
        if (!admin_details.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: this.ResMsg.NOT_FOUND_USER_WITH_EMAIL,
          };
        }
      }

      const commonModel = this.Model.commonModel(trx);
      const checkOtp = await commonModel.getOTP({ email: email, type: type });

      if (checkOtp.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_GONE,
          message: this.ResMsg.THREE_TIMES_EXPIRED,
        };
      }

      const otp = Lib.otpGenNumber(6);
      const hashed_otp = await Lib.hashPass(otp);

      try {
        const [send_email] = await Promise.all([
          email
            ? Lib.sendEmail(
                email,
                OTP_EMAIL_SUBJECT,
                sendEmailOtpTemplate(otp, OTP_FOR)
              )
            : undefined,
        ]);

        if (send_email) {
          await commonModel.insertOTP({
            hashed_otp: hashed_otp,
            email: email,
            type: type,
          });

          return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: this.ResMsg.OTP_SENT,
            data: {
              email,
            },
          };
        } else {
          return {
            success: false,
            code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
            message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
          };
        }
      } catch (error) {
        console.error('Error sending email or SMS:', error);
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
        };
      }
    });
  }

  //match email otp service
  public async matchEmailOtpService(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, otp, type } = req.body;
      const commonModel = this.Model.commonModel(trx);
      const userModel = this.Model.userModel(trx);
      const agentModel = this.Model.agencyModel(trx);
      const checkOtp = await commonModel.getOTP({ email, type });

      if (!checkOtp.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: ResMsg.OTP_EXPIRED,
        };
      }

      const { id: email_otp_id, otp: hashed_otp, tried } = checkOtp[0];

      if (tried > 3) {
        return {
          success: false,
          code: this.StatusCode.HTTP_GONE,
          message: this.ResMsg.TOO_MUCH_ATTEMPT,
        };
      }

      const otpValidation = await Lib.compare(otp.toString(), hashed_otp);

      if (otpValidation) {
        await commonModel.updateOTP(
          {
            tried: tried + 1,
            matched: 1,
          },
          { id: email_otp_id }
        );

        //--change it for member
        let secret = config.JWT_SECRET_ADMIN;
        if (type === OTP_TYPE_FORGET_USER) {
          secret = config.JWT_SECRET_USER;
        } else if (type === OTP_TYPE_VERIFY_USER) {
          const checkUser = await userModel.getProfileDetails({ email });

          if (!checkUser.length || checkUser[0].is_verified) {
            return {
              success: false,
              code: this.StatusCode.HTTP_NOT_FOUND,
              message: 'No unverified user found.',
            };
          }

          await userModel.updateProfile(
            { is_verified: true },
            { id: checkUser[0].id }
          );

          return {
            success: true,
            code: this.StatusCode.HTTP_ACCEPTED,
            message: 'User successfully verified.',
          };
        } else if (type === OTP_TYPE_FORGET_AGENT) {
          secret = config.JWT_SECRET_AGENT;
        }

        const token = Lib.createToken(
          {
            email: email,
            type: type,
          },
          secret,
          '5m'
        );

        return {
          success: true,
          code: this.StatusCode.HTTP_ACCEPTED,
          message: this.ResMsg.OTP_MATCHED,
          token,
        };
      } else {
        await commonModel.updateOTP(
          {
            tried: tried + 1,
          },
          { id: email_otp_id }
        );

        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: this.ResMsg.OTP_INVALID,
        };
      }
    });
  }
}
export default PublicEmailOTPService;
