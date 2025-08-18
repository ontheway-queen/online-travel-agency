import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";
import {
  NOTIFICATION_TYPE_B2B_DEPOSIT_REQUEST,
  PROJECT_EMAIL_ACCOUNT_1,

  PROJECT_EMAIL_API_1,
} from "../../../utils/miscellaneous/constants";
import {
  template_onDepositReqInsert_send_to_admin,
  template_onDepositReqInsert_send_to_agent,
} from "../../../utils/templates/depositTemplates";
import Lib from "../../../utils/lib/lib";
import { IGetFlightSearchHistoryFilterQuery } from "../../../utils/interfaces/searchHistoryModelInterface/searchHistoryModelInterface";

export class BtobService extends AbstractServices {
  //create visa application
  public async insertDeposit(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_name, agency_logo, email: user_email } = req.agency;
      const files = (req.files as Express.Multer.File[]) || [];

      if (files.length) {
        req.body["docs"] = files[0].filename;
      }

      const res = await this.Model.agencyModel(trx).insertAgencyDepositRequest({
        ...req.body,
        agency_id: req.agency.agency_id,
      });

      //send notification to admin
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      await adminNotificationSubService.insertNotification({
        message: `A new deposit request has been created from B2B. Agency - ${agency_name} | Amount - ${req.body.amount}`,
        ref_id: res[0].id,
        type: NOTIFICATION_TYPE_B2B_DEPOSIT_REQUEST,
      });

      // send emails
      await Promise.all([
        Lib.sendEmail(
          [
            PROJECT_EMAIL_ACCOUNT_1,
      
          ],
          "New Deposit Request Received",
          template_onDepositReqInsert_send_to_admin({
            title: "New Deposit Request",
            bank_name: req.body.bank_name,
            total_amount: req.body.amount,
            agency_name,
            remarks: req.body.remarks,
            payment_date: req.body.payment_date,
          })
        ),
        Lib.sendEmail(
          user_email,
          "Deposit Request Acknowledgement",
          template_onDepositReqInsert_send_to_agent({
            title: "Deposit Request Acknowledgement",
            bank_name: req.body.bank_name,
            total_amount: req.body.amount,
            agency_name,
            remarks: req.body.remarks,
            payment_date: req.body.payment_date,
          })
        ),
      ]);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  //get list
  public async getAllDepositRequestList(req: Request) {
    const { agency_id } = req.agency;
    const { limit, skip, status } = req.query;
    const data = await this.Model.agencyModel().getAllAgencyDepositRequest({
      agency_id,
      limit: Number(limit),
      skip: Number(skip),
      status: status as string,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single
  public async getSingleApplication(req: Request) {
    const { id: agent_id } = req.agency;
    const id = req.params.id;
    const model = this.Model.VisaModel();
    const data = await model.b2bSingleApplication(Number(id), agent_id);
    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    const traveler_data = await model.b2bTravelerList(Number(id));
    const tracking_data = await model.b2bTrackingList(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: { ...data[0], traveler_data, tracking_data },
    };
  }

  //get notification
  public async getNotification(req: Request) {
    const { id, agency_id } = req.agency;
    const model = this.Model.agencyNotificationModel();
    const query = req.query;
    const data = await model.getNotifications({
      ...query,
      agency_id,
      user_id: id,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //insert notification seen
  public async insertNotificationSeen(req: Request) {
    const { id } = req.agency;
    const model = this.Model.agencyNotificationModel();
    const { notification_id } = req.body;
    if (!notification_id) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
        message: this.ResMsg.HTTP_UNPROCESSABLE_ENTITY,
      };
    }
    const checkNotification = await model.checkNotificationSeen({
      notification_id,
      user_id: id,
    });
    if (!checkNotification.length) {
      await model.insertNotificationSeen({ notification_id, user_id: id });
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
    };
  }

  //search booking info
  public async searchBookingInfo(req: Request) {
    const { agency_id } = req.agency;
    const model = this.Model.b2bFlightBookingModel();
    const query = req.query;
    const data = await model.searchBookingInfo({ ...query, agency_id });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  //get search history
  public async getSearchHistory(req: Request) {
    const model = this.Model.SearchHistoryModel();
    const { agency_id } = req.agency;
    const { type, from_date, to_date, limit, skip } =
      req.query as unknown as IGetFlightSearchHistoryFilterQuery;
    let data = {
      total: 0,
      data: [],
    };

    if (type === "flight") {
      data = await model.getFlightSearchHistory(
        {
          from_date: from_date,
          to_date: to_date,
          limit: limit,
          skip: skip,
          agency_id,
        },
        true
      );
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }
}
