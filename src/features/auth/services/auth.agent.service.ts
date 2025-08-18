import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import Lib from '../../../utils/lib/lib';
import config from '../../../config/config';
import {
  ILoginPayload,
  IForgetPasswordPayload,
} from '../../public/utils/types/commonTypes';
import { sendEmailOtpTemplate } from '../../../utils/templates/sendEmailOtp';
import { OTP_TYPE_AGENT_2FA } from '../../../utils/miscellaneous/constants';

class AgentAuthService extends AbstractServices {
  //login
  public async loginService(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, password } = req.body as ILoginPayload;
      const model = this.Model.agencyModel(trx);
      const checkUser = await model.getSingleUser({ email });

      if (!checkUser.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }
      const { hashed_password: hashPass, agency_id, ...rest } = checkUser[0];
      const checkPass = await Lib.compare(password, hashPass);

      if (!checkPass) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      if (checkUser[0]?.requested_status == 'pending') {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: 'Your account is not approved yet',
        };
      } else if (rest.status == false) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: 'Your account has been disabled',
        };
      }

      if (checkUser[0]?.agency_status == false) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: 'Your agency account has been disabled',
        };
      }

      if (checkUser[0]?.twoFA === 1) {
        const commonModel = this.Model.commonModel(trx);
        const checkOtp = await commonModel.getOTP({ email, type: OTP_TYPE_AGENT_2FA });
        if (checkOtp.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_FORBIDDEN,
            message: "Cannot send another OTP before 3 minutes! Please try again later.",
          };
        }
        const otp = Lib.otpGenNumber(6);
        const hashed_otp = await Lib.hashPass(otp);
        await commonModel.insertOTP({
          hashed_otp: hashed_otp,
          email: email,
          type: OTP_TYPE_AGENT_2FA,
        });
        Lib.sendEmail(
          checkUser[0].email,
          'Login Verification Code',
          sendEmailOtpTemplate(otp, 'login')
        );
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'An OTP has been sent to your login email address',
          data: {
            email: checkUser[0].email,
            twoFA: 1,
          },
        };
      }

      req.agency = {
        id: rest.id,
        agency_id: agency_id,
        name: rest.name,
        email: rest.email,
        mobile_number: rest.mobile_number,
        photo: rest.photo,
        user_status: rest.status,
        address: rest.address,
        agency_logo: checkUser[0].agency_logo,
        agency_name: checkUser[0].agency_name,
        agency_status: checkUser[0].agency_status,
        commission_set_id: checkUser[0].commission_set_id,
        ref_id: checkUser[0].ref_id,
      }

      const token_data = {
        id: rest.id,
        name: rest.name,
        email: rest.email,
        mobile_number: rest.mobile_number,
        photo: rest.photo,
        user_status: rest.status,
        agency_id: agency_id,
        address: rest.address,
        agency_logo: checkUser[0].agency_logo,
        agency_name: checkUser[0].agency_name,
        agency_status: checkUser[0].agency_status,
        twoFA: 0,
      };

      const token = Lib.createToken(token_data, config.JWT_SECRET_AGENT, '10h');
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: token_data,
        token,
      };
    });
  }

  // verify otp
  public async verifyOTP(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, otp } = req.body;

      const commonModel = this.Model.commonModel(trx);
      const checkOtp = await commonModel.getOTP({ email, type: OTP_TYPE_AGENT_2FA });
      if (!checkOtp.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: this.ResMsg.OTP_EXPIRED,
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
        const model = this.Model.agencyModel(trx);

        const user = await model.getSingleUser({ email });
        const token_data = {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
          mobile_number: user[0].mobile_number,
          photo: user[0].photo,
          user_status: user[0].status,
          agency_id: user[0].agency_id,
          agency_logo: user[0].agency_logo,
          agency_name: user[0].agency_name,
          agency_status: user[0].agency_status,
        };
        const token = Lib.createToken(token_data, config.JWT_SECRET_AGENT, '10h');
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'OTP verified successfully. You are now logged in.',
          data: token_data,
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
          code: this.StatusCode.HTTP_UNAUTHORIZED,
          message: this.ResMsg.OTP_INVALID,
        };
      }
    });
  }

  //resend otp
  public async resendOTP(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email } = req.body;
      const model = this.Model.agencyModel(trx);
      const checkUser = await model.getSingleUser({ email });

      if (checkUser[0]?.twoFA === 1) {
        const commonModel = this.Model.commonModel(trx);
        const checkOtp = await commonModel.getOTP({ email, type: OTP_TYPE_AGENT_2FA });
        if (checkOtp.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_FORBIDDEN,
            message: "Cannot send another OTP before 3 minutes! Please try again later.",
          };
        }
        const otp = Lib.otpGenNumber(6);
        const hashed_otp = await Lib.hashPass(otp);
        await commonModel.insertOTP({
          hashed_otp: hashed_otp,
          email: email,
          type: OTP_TYPE_AGENT_2FA,
        });
        Lib.sendEmail(
          checkUser[0].email,
          'Login Verification Code',
          sendEmailOtpTemplate(otp, 'login')
        );
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'An OTP has been sent to your login email address',
          data: {
            email: checkUser[0].email,
            twoFA: 1,
          },
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Resend OTP is failed',
        };
      }
    });
  }

  //forget pass
  public async forgetPassword(req: Request) {
    const { token, email, password } = req.body as IForgetPasswordPayload;
    const token_verify: any = Lib.verifyToken(token, config.JWT_SECRET_AGENT);

    if (!token_verify) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNAUTHORIZED,
        message: this.ResMsg.HTTP_UNAUTHORIZED,
      };
    }

    const { email: verify_email } = token_verify;
    if (email === verify_email) {
      const hashed_pass = await Lib.hashPass(password);
      const model = this.Model.agencyModel();
      const get_user = await model.getSingleUser({ email });
      await model.updateAgencyUser(
        { hashed_password: hashed_pass },
        get_user[0].id
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.PASSWORD_CHANGED,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: this.StatusCode.HTTP_FORBIDDEN,
      };
    }
  }
}

export default AgentAuthService;
