import AbstractServices from "../../../../abstract/abstract.service";
import axios from "axios";
import config from "../../../../config/config";
import {
  INVOICE_TYPE_FLIGHT,
  INVOICE_TYPE_TOUR,
  INVOICE_TYPE_UMRAH,
  INVOICE_TYPE_VISA,
  PROJECT_CODE,
  PROJECT_NAME,
  SERVER_URL,
} from "../../../../utils/miscellaneous/constants";
import qs from "qs";
import { ISSLPaymentPayload } from "../../utils/types/sslPayment.interface";
import { invoiceTemplate } from "../../../../utils/templates/invoiceTemplate";
import Lib from "../../../../utils/lib/lib";
import { Knex } from "knex";

export class BookingPaymentService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx?: Knex.Transaction) {
    super();
    this.trx = trx || ({} as Knex.Transaction);
  }
  //ssl payment
  public async sslPayment(body: ISSLPaymentPayload) {
    try {
      const ssl_body = {
        ...body,
        store_id: config.SSL_STORE_ID,
        store_passwd: config.SSL_STORE_PASSWORD,
        success_url: `${SERVER_URL}/payment/success`,
        fail_url: `${SERVER_URL}/payment/failed`,
        cancel_url: `${SERVER_URL}/payment/cancelled`,
        shipping_method: "no",
        product_category: "General",
        product_profile: "General",
      };

      const response: any = await axios.post(
        `${config.SSL_URL}/gwprocess/v4/api.php`,
        qs.stringify(ssl_body),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response?.data?.status === "SUCCESS") {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          redirect_url: response.data.redirectGatewayURL,
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: "Something went wrong!",
        };
      }
    } catch (err) {
      console.log("SSL ERROR", err);
      return {
        success: false,
        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: "Something went wrong",
      };
    }
  }

  //create invoice
  public async createInvoice(data: {
    agency_id: number;
    user_id?: number;
    ref_id: number;
    ref_type: string;
    total_amount: number;
    due: number;
    details: string;
    user_name: string;
    email: string;
    total_travelers: number;
    travelers_type: string;
    bookingId: string;
    agency_logo: string;
    due_clear_last_day?: Date | string;
  }) {
    const paymentModel = this.Model.btobPaymentModel(this.trx);
    const invoice_data = await paymentModel.getLastInvoice({ });

    let invoice_number;
    if (invoice_data.data.length) {
      invoice_number = Number(
        invoice_data.data[0].invoice_number.split("-")[1]
      );
    } else {
      invoice_number = 0;
    }
    invoice_number =
      `${PROJECT_CODE}-` + (invoice_number + 1).toString().padStart(7, "0");

    const invoice = await paymentModel.insertInvoice({
      agency_id: data.agency_id,
      user_id: data.user_id,
      ref_id: data.ref_id,
      ref_type: data.ref_type,
      total_amount: data.total_amount,
      due: data.due,
      details: data.details,
      invoice_number,
      due_clear_last_day: data.due_clear_last_day
    });

    const invoiceMailData = {
      name: data.user_name,
      invoiceNumber: invoice_number,
      bookingType: data.ref_type,
      date: new Date(invoice[0].created_at).toLocaleString(),
      totalTravelers: data.total_travelers,
      JType: data.travelers_type,
      totalAmount: data.total_amount,
    };

    let invoiceFor;
    if (data.ref_type === INVOICE_TYPE_FLIGHT) {
      invoiceFor = "Flight Booking";
    } else if (data.ref_type === INVOICE_TYPE_VISA) {
      invoiceFor = "Visa Application";
    } else if (data.ref_type === INVOICE_TYPE_UMRAH) {
      invoiceFor = "Umrah Package Booking";
    } else if (data.ref_type === INVOICE_TYPE_TOUR) {
      invoiceFor = "Tour Package Booking";
    }

    await Lib.sendEmail(
      data.email,
      `Invoice for Your ${invoiceFor} id: ${data.bookingId} | ${PROJECT_NAME}`,
      invoiceTemplate(invoiceMailData)
    );

    return invoice;
  }
}
