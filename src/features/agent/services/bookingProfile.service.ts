import {
  IProfile,
  IChangePasswordPayload,
} from "../utils/types/bookingProfile.interfaces";
import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";
import Lib from "../../../utils/lib/lib";
import CustomError from "../../../utils/lib/customError";

export default class BookingProfileService extends AbstractServices {
  //get profile
  public async getProfile(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, agency_id } = req.agency;
      const model = this.Model.agencyModel(trx);
      const checkUser = await model.getSingleUser({ id });

      if (!checkUser.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        }
      }

      const { hashed_password, role_id, ...rest } = checkUser[0];

      const agency_model = this.Model.agencyModel(trx);
      const balance = await agency_model.getTotalBalance(agency_id);
      rest.balance = balance;

      const agencyAdmModel = this.Model.btobAdministrationModel(trx);

      let role_permission: any = [];

      if (role_id) {
        role_permission = await agencyAdmModel.getSingleRole({
          id: parseInt(role_id),
          agency_id,
        });
      }

      const agency_details = await agency_model.getSingleAgency(agency_id);

      if (agency_details[0].kam) {
        const getKAM = await this.Model.adminModel(trx).getSingleAdmin({
          id: agency_details[0].kam,
        });
        if (getKAM.length) {
          (rest.kam_name = getKAM[0].first_name + " " + getKAM[0].last_name),
            (rest.kam_email = getKAM[0].email),
            (rest.kam_phone_number = getKAM[0].phone_number);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          role_id,
          ...rest,
          address: agency_details[0]?.address,
          agency_logo: agency_details[0]?.agency_logo,
          permissions: role_permission.length ? role_permission[0] : [],
        },
      };
    });
  }

  //edit profile
  public async editProfile(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, agency_id } = req.agency;
      const files = (req.files as Express.Multer.File[]) || [];

      const body = req.body;
      const model = this.Model.agencyModel();

      const checkAgency = await model.getSingleAgency(agency_id);

      if (body.agency_email && body.agency_email !== checkAgency[0].email) {
        const checkMail = await model.checkAgency({
          email: body.agency_email,
        });

        if (checkMail.data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "The email address already exists",
          };
        }
      }

      for (const file of files) {
        console.log({ file });
        if (file.fieldname === "agency_logo" || file.fieldname === "photo") {
          body[file.fieldname] = file.filename;
        } else {
          throw new CustomError(
            "Unknown file name",
            this.StatusCode.HTTP_CONFLICT,
            "WARNING"
          );
        }
      }

      const agencyBody = {
        agency_name: body.agency_name,
        email: body.agency_email,
        phone: body.agency_phone,
        address: body.agency_address,
        agency_logo: body.agency_logo,
      };

      const userBody = {
        name: body.name,
        mobile_number: body.mobile_number,
        twoFA: body.twoFA,
        photo: body.photo,
      };

      await model.updateAgencyUser(userBody, id);
      await model.updateAgency(agencyBody, agency_id);

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: req.body,
      };
    });
  }

  //change password
  public async changePassword(req: Request) {
    const { id } = req.agency;
    const { old_password, new_password } = req.body as IChangePasswordPayload;

    const model = this.Model.agencyModel();
    const user_details = await model.getSingleUser({ id });
    if (!user_details.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const verify_password = await Lib.compare(
      old_password,
      user_details[0].hashed_password
    );
    if (!verify_password) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.PASSWORD_DOES_NOT_MATCH,
      };
    }

    const hashed_password = await Lib.hashPass(new_password);
    const password_changed = await model.updateAgencyUser(
      { hashed_password: hashed_password },
      id
    );
    if (password_changed) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.PASSWORD_CHANGED,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
      };
    }
  }

  public async getKeyAreaManager(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id } = req.agency;

      const agencyModel = this.Model.agencyModel(trx);
      const getAgency = await agencyModel.getSingleAgency(agency_id);

      if (!getAgency[0].kam) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: [],
        };
      }

      const adminModel = this.Model.adminModel(trx);
      const getKAM = await adminModel.getSingleAdmin({ id: getAgency[0].kam });

      if (!getKAM.length) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: [],
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          name: getKAM[0].first_name + " " + getKAM[0].last_name,
          email: getKAM[0].email,
          phone_number: getKAM[0].phone_number,
        },
      };
    });
  }
}
