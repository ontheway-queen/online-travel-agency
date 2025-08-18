import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { B2bRegistrationRequestPayload } from "../../../utils/interfaces/agent/b2bRegistrationRequest.interfacet";
import Lib from "../../../utils/lib/lib";
import { OTP_TYPE_AGENT_REGISTRATION } from "../../../utils/miscellaneous/constants";
import { agentRegistrationTemplate } from "../../../utils/templates/registrationTemplate";
import { sendEmailOtpTemplate } from "../../../utils/templates/sendEmailOtp";

export default class B2bRegistrationRequestService extends AbstractServices {
  // Create B2B registration request
  public async createRegistrationRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.b2bRegistrationRequestModel(trx);

      const {
        name,
        email,
        mobile_number,
        address,
        postal_code,
        agency_name,
        agency_phone,
      } = req.body;


      const files = (req.files as Express.Multer.File[]) || [];

      const existingRequest = await model.getSingleRegistrationRequest({ email });
      if (existingRequest) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "A registration request with this email already exists.",
        };
      }

      // Prepare file fields
      const fileFields = files.reduce(
        (acc: { [key: string]: string }, file) => {
          acc[file.fieldname] = file.filename;
          return acc;
        },
        {
          agency_logo: "",
          photo: "",
          trade_license: "",
          visiting_card: ""
        }
      );

      // Prepare new payload
      const newPayload = {
        name,
        email,
        mobile_number,
        address,
        postal_code,
        agency_email: email,
        agency_name,
        agency_phone,
        ...fileFields,
      };

      //send otp
      const commonModel = this.Model.commonModel(trx);
      const checkOtp = await commonModel.getOTP({ email, type: OTP_TYPE_AGENT_REGISTRATION });
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
        type: OTP_TYPE_AGENT_REGISTRATION,
      });
      Lib.sendEmail(
        email,
        'Registration Verification Code',
        sendEmailOtpTemplate(otp, 'registration')
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'An OTP has been sent to your login email address',
        data: {
          email: email,
          payload: newPayload,
        },
      };
    });
  }

  public async verifyRegistrationRequest(email: string, otp: string, payload: B2bRegistrationRequestPayload) {
    return await this.db.transaction(async (trx) => {
      const commonModel = this.Model.commonModel(trx);
      const checkOtp = await commonModel.getOTP({
        email,
        type: OTP_TYPE_AGENT_REGISTRATION,
      });
      console.log({
        email,
        type: OTP_TYPE_AGENT_REGISTRATION,
      });
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

        const model = this.Model.b2bRegistrationRequestModel(trx);
        await model.createRegistrationRequest(payload);

        await Lib.sendEmail(
          email,
          'Welcome to online travel agency!',
          agentRegistrationTemplate({ name: payload.name })
        );

        return {
          success: true,
          code: this.StatusCode.HTTP_SUCCESSFUL,
          message: 'Your B2B registration request has been successfully submitted. Our team will review your request and provide you with further updates. Upon completion of the review, a B2B user account will be created for your agency.',
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
}
