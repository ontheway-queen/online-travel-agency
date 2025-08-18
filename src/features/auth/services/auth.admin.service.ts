import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../../utils/lib/lib";
import config from "../../../config/config";
import {
  ILoginPayload,
  IForgetPasswordPayload,
} from "../../public/utils/types/commonTypes";
import { OTP_TYPE_ADMIN_2FA } from "../../../utils/miscellaneous/constants";
import { sendEmailOtpTemplate } from "../../../utils/templates/sendEmailOtp";

class AdminAuthService extends AbstractServices {
  //login
  public async loginService(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, password } = req.body as ILoginPayload;
      const model = this.Model.adminModel(trx);
      const checkUser = await model.getSingleAdmin({ email });
      // console.log(checkUser);
      if (!checkUser.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      const { password_hash: hashPass, role_id, ...rest } = checkUser[0];
      const checkPass = await Lib.compare(password, hashPass);

      if (!checkPass) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.WRONG_CREDENTIALS,
        };
      }

      if (rest.status === false) {
        return {
          success: false,
          code: this.StatusCode.HTTP_FORBIDDEN,
          message: "Your account has been disabled",
        };
      }

      if (checkUser[0]?.twoFA === 1) {
        const commonModel = this.Model.commonModel(trx);
        const checkOtp = await commonModel.getOTP({ email, type: OTP_TYPE_ADMIN_2FA });
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
          type: OTP_TYPE_ADMIN_2FA,
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

      const admModel = this.Model.administrationModel(trx);

      const role_permission = await admModel.getSingleRole({
        id: parseInt(role_id),
      });

      const token_data = {
        id: rest.id,
        username: rest.username,
        first_name: rest.first_name,
        last_name: rest.last_name,
        gender: rest.gender,
        phone_number: rest.phone_number,
        role_id: rest.role_id,
        photo: rest.photo,
        status: rest.status,
        email: rest.email,
      };
      const token = Lib.createToken(token_data, config.JWT_SECRET_ADMIN, "10h");

      req.admin = {
        id: rest.id,
        username: rest.username,
        first_name: rest.first_name,
        last_name: rest.last_name,
        gender: rest.gender,
        phone_number: rest.phone_number,
        role_id: rest.role_id,
        photo: rest.photo,
        status: rest.status,
        email: rest.email,
      };
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.LOGIN_SUCCESSFUL,
        data: {
          ...rest,
          permissions: role_permission.length ? role_permission[0] : [],
        },
        token,
      };
    })
  }

  // verify otp
  public async verifyOTP(req: Request) {
    return this.db.transaction(async (trx) => {
      const { email, otp } = req.body;

      const commonModel = this.Model.commonModel(trx);
      const checkOtp = await commonModel.getOTP({ email, type: OTP_TYPE_ADMIN_2FA });
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

        const model = this.Model.adminModel(trx);
        const checkUser = await model.getSingleAdmin({ email });
        const { role_id, ...rest } = checkUser[0];
        const administrationModel = this.Model.administrationModel(trx);
        const role_permission = await administrationModel.getSingleRole({
          id: parseInt(role_id),
        });

        const token_data = {
          id: rest.id,
          username: rest.username,
          first_name: rest.first_name,
          last_name: rest.last_name,
          gender: rest.gender,
          phone_number: rest.phone_number,
          role_id: rest.role_id,
          photo: rest.photo,
          status: rest.status,
          email: rest.email,
        };
        const token = Lib.createToken(token_data, config.JWT_SECRET_ADMIN, "10h");

        req.admin = {
          id: rest.id,
          username: rest.username,
          first_name: rest.first_name,
          last_name: rest.last_name,
          gender: rest.gender,
          phone_number: rest.phone_number,
          role_id: rest.role_id,
          photo: rest.photo,
          status: rest.status,
          email: rest.email,
        };
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: 'OTP verified successfully. You are now logged in.',
          data: {
            ...rest,
            permissions: role_permission.length ? role_permission[0] : [],
          },
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
      const model = this.Model.adminModel(trx);
      const checkUser = await model.getSingleAdmin({ email });

      if (checkUser[0]?.twoFA === 1) {
        const commonModel = this.Model.commonModel(trx);
        const checkOtp = await commonModel.getOTP({ email, type: OTP_TYPE_ADMIN_2FA });
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
          type: OTP_TYPE_ADMIN_2FA,
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
    const token_verify: any = Lib.verifyToken(token, config.JWT_SECRET_ADMIN);

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
      const model = this.Model.adminModel();
      const get_admin = await model.getSingleAdmin({ email });
      await model.updateUserAdmin(
        { password_hash: hashed_pass },
        { id: get_admin[0].id }
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

export default AdminAuthService;
