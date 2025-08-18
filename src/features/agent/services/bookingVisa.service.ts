import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { ICreateAppTravelerPayload } from "../../../utils/interfaces/visa/visa.interface";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";
import {
  INVOICE_TYPE_VISA,
  NOTIFICATION_TYPE_B2B_VISA_APPLICATION,
  PROJECT_CODE,
  PROJECT_EMAIL_API_1,
  PROJECT_IMAGE_URL,
  TRAVELER_TYPE_PASSENGERS,
} from "../../../utils/miscellaneous/constants";
import Lib from "../../../utils/lib/lib";
import {
  template_onCreateVisaApp_sent_to_admin,
  template_onCreateVisaApp_sent_to_agent,
} from "../../../utils/templates/visaApplicationEmail";
import { BookingPaymentService } from "./subServices/payment.service";

export class B2BVisaService extends AbstractServices {
  //create visa application
  public async createVisaApplication(req: Request) {
    return await this.db.transaction(async (trx) => {
      const {
        id,
        agency_id,
        name,
        email: user_email,
        agency_logo,
      } = req.agency;

      const model = this.Model.VisaModel(trx);
      const agencyModel = this.Model.agencyModel(trx);
      const body = req.body;
      const { visa_id } = body;
      const data = await model.single(visa_id, true);
      if (!data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      const payable =
        Number(data[0].processing_fee) * Number(body.traveler);

      //check balance
      const balance = await agencyModel.getTotalBalance(agency_id);

      if (Number(payable) > Number(balance)) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "There is insufficient balance in agency account",
        };
      }

      //get booking_ref id & increase the number of entry by one
      const last_entry = await this.Model.lastServiceEntryModel(trx).getLastRefId({ type: INVOICE_TYPE_VISA });
      const booking_ref_id = `${PROJECT_CODE}-V-${(Number(last_entry) + 1).toString().padStart(5, "0")}`;
      await this.Model.lastServiceEntryModel(trx).incrementLastRefId({ type: INVOICE_TYPE_VISA });


      const files = (req.files as Express.Multer.File[]) || [];

      const application_body = {
        agency_id: agency_id,
        agent_id: id,
        visa_id: visa_id,
        from_date: body.from_date,
        to_date: body.to_date,
        traveler: body.traveler,
        visa_fee: data[0].visa_fee,
        processing_fee: data[0].processing_fee,
        payable: payable,
        application_date: new Date(),
        contact_email: body.contact_email,
        contact_number: body.contact_number,
        whatsapp_number: body.whatsapp_number,
        nationality: body.nationality,
        residence: body.residence,
        booking_ref: booking_ref_id
      };

      const create_application = await model.b2bCreateApplication(
        application_body
      );
      if (create_application.length) {
        let traveler_body: ICreateAppTravelerPayload[] = [];
        traveler_body = body.passengers.map((obj: any) => {
          const { key, ...rest } = obj;
          let required_fields: { [key: string]: string } = {};
          for (const file of files) {
            if (file.fieldname?.split("-")[1] == key) {
              required_fields[file.fieldname.split("-")[0]] = file.filename;
            }
          }
          rest.required_fields = required_fields;
          return { ...rest, application_id: create_application[0].id };
        });
        await model.b2bCreateTraveler(traveler_body);



        //debit amount
        await agencyModel.insertAgencyLedger({
          agency_id: agency_id,
          type: "debit",
          amount: payable,
          details: `Debit for visa application - application ID: ${booking_ref_id}.`,
        });

        //tracking body
        const tracking_body = [{
          application_id: create_application[0].id,
          status: "pending",
          details: `${name} has applied for the visa`,
        },
        {
          application_id: create_application[0].id,
          status: "paid",
          details: `${name} has paid ${payable}/= for the processing fee`,
        }];
        await model.b2bCreateTracking(tracking_body);

        //invoice
        await new BookingPaymentService(trx).createInvoice({
          agency_id,
          user_id: id,
          ref_id: create_application[0].id,
          ref_type: INVOICE_TYPE_VISA,
          total_amount: payable,
          due: 0,
          details: `Invoice has been created for visa application id ${booking_ref_id} (only processing fee has been applied)`,
          user_name: name,
          email:user_email,
          total_travelers:body.traveler,
          travelers_type:TRAVELER_TYPE_PASSENGERS,
          bookingId: booking_ref_id,
          agency_logo
        });

        //send notification to admin
        const adminNotificationSubService = new AdminNotificationSubService(trx);
        await adminNotificationSubService.insertNotification({
          message: `New Application for Visa from B2B. Application ID: ${booking_ref_id}`,
          ref_id: create_application[0].id,
          type: NOTIFICATION_TYPE_B2B_VISA_APPLICATION,
        });

        // send email notification
        await Promise.all([
          Lib.sendEmail(
            PROJECT_EMAIL_API_1,
            `Received a new visa application - ${data[0].country_name} - ${data[0].visa_mode || ""
            }`,
            template_onCreateVisaApp_sent_to_admin({
              name: name,
              visaMode: data[0].visa_mode,
              destination: data[0].country_name,
              numOfTravellers: Number(body.traveler),
              applicationId: booking_ref_id,
              price: payable,
              logo: PROJECT_IMAGE_URL + "/" + agency_logo,
            })
          ),
          Lib.sendEmail(
            user_email,
            `Your visa application for ${data[0].country_name} (${data[0].visa_mode || ""
            }) has been created`,
            template_onCreateVisaApp_sent_to_agent({
              name: name,
              visaMode: data[0].visa_mode,
              destination: data[0].country_name,
              numOfTravellers: Number(body.traveler),
              applicationId: booking_ref_id,
              price: payable,
              logo: PROJECT_IMAGE_URL + "/" + agency_logo,
            })
          ),
        ]);

        return {
          success: true,
          code: this.StatusCode.HTTP_SUCCESSFUL,
          message: this.ResMsg.HTTP_SUCCESSFUL,
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
        };
      }
    });
  }

  //get list
  public async getApplicationList(req: Request) {
    const { id } = req.agency;
    const model = this.Model.VisaModel();
    const { limit, skip } = req.query;
    const data = await model.getB2BApplication(
      {
        agent_id: id,
        limit: limit ? Number(limit) : 100,
        skip: skip ? Number(skip) : 0,
      },
      true
    );
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
}
