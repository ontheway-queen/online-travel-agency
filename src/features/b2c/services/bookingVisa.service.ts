import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { ICreateAppTravelerPayload } from "../../../utils/interfaces/visa/visa.interface";
import Lib from "../../../utils/lib/lib";
import { visaApplicationEmail } from "../../../utils/templates/visaApplicationEmail";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";
import {
  INVOICE_TYPE_VISA,
  NOTIFICATION_TYPE_B2C_VISA_APPLICATION,
  PROJECT_CODE,
} from "../../../utils/miscellaneous/constants";

export class BookingVisaService extends AbstractServices {
  //create visa application
  public async createVisaApplication(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, first_name, last_name, email } = req.user;

      const model = this.Model.VisaModel(trx);
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
        (Number(data[0].visa_fee) + Number(data[0].processing_fee)) *
        Number(body.traveler);

      //get booking_ref id & increase the number of entry by one
      const last_entry = await this.Model.lastServiceEntryModel(
        trx
      ).getLastRefId({ type: INVOICE_TYPE_VISA });
      const booking_ref_id = `${PROJECT_CODE}-V-${(Number(last_entry) + 1)
        .toString()
        .padStart(5, "0")}`;
      await this.Model.lastServiceEntryModel(trx).incrementLastRefId({
        type: INVOICE_TYPE_VISA,
      });

      const files = (req.files as Express.Multer.File[]) || [];

      const application_body = {
        user_id: id,
        visa_id: visa_id,
        // from_date: body.from_date,
        // to_date: body.to_date,
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
        booking_ref: booking_ref_id,
      };

      //b2c create application
      const create_application = await model.b2cCreateApplication(
        application_body
      );

      const passengers_parse = body.passengers;

      // const imgFiles: any = {};

      // for (let i = 0; i < passengers_parse.length; i++) {
      //   for (let j = 0; j < files.length; j++) {
      //     if (passengers_parse[i].passport_number === files[j].fieldname) {
      //       imgFiles[passengers_parse[i].passport_number] = files[j].filename;
      //     }
      //   }
      // }

      //b2c create traveler
      if (create_application.length) {
        // let traveler_body: ICreateAppTravelerPayload[] = [];
        // traveler_body = body?.passengers.map((obj: any) => {
        //   return {
        //     ...obj,
        //     application_id: create_application[0].id,
        //     passport_img: imgFiles[obj.passport_number],
        //   };
        // });
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

        await model.b2cCreateTraveler(traveler_body);

        const tracking_body = {
          application_id: create_application[0].id,
          status: "pending",
          details: `${first_name} ${last_name} has applied for the visa`,
        };
        await model.b2cCreateTracking(tracking_body);

        //create invoice
        const paymentModel = this.Model.paymentModel(trx);
        const invoice_data = await paymentModel.getInvoice({ limit: 1 });
        let invoice_number;
        if (invoice_data.data.length) {
          invoice_number = Number(
            invoice_data.data[0].invoice_number.split("-")[1]
          );
        } else {
          invoice_number = 0;
        }

        invoice_number =
          `${PROJECT_CODE}IC-` +
          (invoice_number + 1).toString().padStart(7, "0");

        const invoice: any = await paymentModel.insertInvoice({
          user_id: id,
          ref_id: create_application[0].id,
          ref_type: "visa",
          total_amount: payable,
          due: payable,
          details: `Invoice has been created for visa application id ${create_application[0].id}`,
          invoice_number,
        });

        //send notification to admin
        const adminNotificationSubService = new AdminNotificationSubService(
          trx
        );
        await adminNotificationSubService.insertNotification({
          message: `New Application for Visa from B2C. Application ID: ${create_application[0].id}`,
          ref_id: create_application[0].id,
          type: NOTIFICATION_TYPE_B2C_VISA_APPLICATION,
        });

        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Visa application created successfully",
          invoiceId: invoice[0].id,
          invoice_number: invoice[0].invoice_number,
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
    const { id } = req.user;
    // console.log(req.user);
    const model = this.Model.VisaModel();
    const { limit, skip } = req.query;
    const data = await model.getB2CApplication(
      {
        user_id: id,
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
    const { id: user_id } = req.user;
    const id = req.params.id;
    const model = this.Model.VisaModel();
    const data = await model.b2cSingleApplication(Number(id), user_id);
    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    // console.log(data);
    const traveler_data = await model.b2cTravelerList(Number(id));
    const tracking_data = await model.b2cTrackingList(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: { ...data, traveler_data, tracking_data },
    };
  }
}
