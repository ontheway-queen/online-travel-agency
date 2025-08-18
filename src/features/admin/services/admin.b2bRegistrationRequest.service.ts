import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../../utils/lib/lib";
import {
  AgencyRegistrationRequestApprovedTemplate,
  AgencyRegistrationRequestRejectedTemplate,
  newAgencyAccount,
} from "../../../utils/templates/sendEmailCredential";
import { PROJECT_CODE, PROJECT_EMAIL_OTHERS_1, REGISTRATION_REQUEST_STATE } from "../../../utils/miscellaneous/constants";
import CustomError from "../../../utils/lib/customError";

export class AdminBtoBRegistrationRequestService extends AbstractServices {
  constructor() {
    super();
  }
  // get all registration request
  public async getAllRegistrationRequest(req: Request) {
    const query = req.query;

    const model = this.Model.b2bRegistrationRequestModel();
    const { total, data } = await model.getAllRegistrationRequests(query);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  // get single registration request
  public async getSingleRegistrationRequest(req: Request) {
    const { id } = req.params;

    const model = this.Model.b2bRegistrationRequestModel();
    const data = await model.getSingleRegistrationRequest({
      id: +id,
    });

    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.StatusCode.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }

  // update single registration request
  public async updateSingleRegistrationRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.params;
      const body = req.body;
      const { id: admin_id } = req.admin;

      const model = this.Model.b2bRegistrationRequestModel();
      const agencyModel = this.Model.agencyModel(trx);
      const administrationModel = this.Model.btobAdministrationModel(trx);
      const data = await model.getSingleRegistrationRequest({
        id: +id,
      });

      if (!data) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.StatusCode.HTTP_NOT_FOUND,
        };
      }

      if (data.state !== REGISTRATION_REQUEST_STATE.PENDING) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message:
            "The request has already been updated once; it is not possible to update it again",
        };
      }

      if (body.state === REGISTRATION_REQUEST_STATE.APPROVED) {
        body.approved_by = admin_id;

        const userEmailExists = await agencyModel.getSingleUser({
          email: data.email,
        });

        if (userEmailExists.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "User email already exists.",
          };
        }

        const kam_info = await this.Model.adminModel(trx).getSingleAdmin({ email: req.body.kam_email });
        if (!kam_info.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "No admin has been found with this email address"
          }
        }

        //unique id of agency
        let agency_ref_number = `${PROJECT_CODE}AR-`;
        const getLastAgency = await agencyModel.checkAgency({
          limit: 1,
        });
        if (!getLastAgency.data.length) {
          agency_ref_number += "1000";
        } else {
          const lastRef = getLastAgency.data?.[0]?.agency_ref_number
            ? getLastAgency.data?.[0]?.agency_ref_number?.split("-")[1]
            : "0";
          const nextNumber = (parseInt(lastRef, 10) + 1)
            .toString()
            .padStart(4, "0");
          agency_ref_number += nextNumber;
        }

        const agencyBody: any = {
          agency_name: data.agency_name,
          email: data.agency_email,
          phone: data.agency_phone,
          address: data.address,
          created_by: admin_id,
          commission_set_id: body.commission_set_id,
          agency_logo: data.agency_logo,
          trade_license: data.trade_license,
          visiting_card: data.visiting_card,
          kam: kam_info[0].id,
          agency_ref_number,
        };

        const user_password = Lib.generateRandomPassword(12);

        const hashed_password = await Lib.hashPass(user_password);

        const userBody: any = {
          name: data.name,
          email: data.email,
          photo: data.photo,
          hashed_password,
          mobile_number: data.mobile_number,
          is_main_user: 1,
        };

        const agency = await agencyModel.createAgency(agencyBody);

        const { data: permissions } = await administrationModel.permissionsList(
          {}
        );

        const role = await administrationModel.createRole({
          name: "Super Admin",
          agency_id: agency[0].id,
          is_main_role: 1,
        });

        userBody["agency_id"] = agency[0].id;
        userBody["role_id"] = role[0].id;

        const role_permissions = permissions.map((permission) => ({
          permission_id: permission.permission_id,
          read: 1,
          write: 1,
          delete: 1,
          update: 1,
          agency_id: agency[0].id,
          role_id: role[0].id,
        }));

        if (role_permissions.length) {
          await administrationModel.createRolePermission(role_permissions);
        }

        const new_agency_user = await agencyModel.createAgencyUser(userBody);

        if (!new_agency_user.length) {
          throw new CustomError(
            "Failed to create agency user.",
            this.StatusCode.HTTP_INTERNAL_SERVER_ERROR
          );
        }

        const mailSubject = "Credentials For B2B Login.";

        await Lib.sendEmail(
          data.email,
          mailSubject,
          AgencyRegistrationRequestApprovedTemplate(data.email, user_password)
        );

        await Lib.sendEmail(
          [PROJECT_EMAIL_OTHERS_1],
          mailSubject,
          AgencyRegistrationRequestApprovedTemplate(data.email, user_password)
        );
      } else if (body.state === REGISTRATION_REQUEST_STATE.REJECTED) {
        const mailSubject = "Your B2B Registration Request Has Been Declined.";

        body.rejected_by = admin_id;

        await Lib.sendEmail(
          data.email,
          mailSubject,
          AgencyRegistrationRequestRejectedTemplate()
        );

        await Lib.sendEmail(
          [PROJECT_EMAIL_OTHERS_1],
          mailSubject,
          AgencyRegistrationRequestRejectedTemplate()
        );
      }

      const updateRegistrationRequest = {
        approved_by: body.approved_by,
        rejected_by: body.rejected_by,
        rejected_reason: body.rejected_reason,
        state: body.state,
        status: body.status,
      };

      const res = await model.updateRegistrationRequest(
        { id: +id },
        updateRegistrationRequest
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          id: res[0].id,
        },
      };
    });
  }
}
