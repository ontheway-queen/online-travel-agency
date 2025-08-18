import { Request, Response } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { BookingPaymentService } from "./subServices/payment.service";
import {
  BKASH_PERCENTAGE,
  BTOC_PAYMENT_TYPE,
  CALLBACK_URL,
  SSL_PERCENTAGE,
} from "../../../utils/miscellaneous/constants";
import Lib from "../../../utils/lib/lib";
import config from "../../../config/config";
import PublicCommonBkashService from "../../public/services/publicBkash.service";
import { CREATE_PAYMENT } from "../../../utils/miscellaneous/bkashApiEndpoints";
import axios from "axios";
import CustomError from "../../../utils/lib/customError";
import PublicSSLService from "../../public/services/publicSSL.service";
export class BookingPaymentServices extends AbstractServices {
  private subServices = new BookingPaymentService();
  private common_service = new PublicCommonBkashService();

  //create payment
  public async createPayment(req: Request) {
    const { id: user_id, first_name, email, phone_number } = req.user;

    const { invoice_id } = req.params as unknown as {
      invoice_id: number;
    };

    const { isApp } = req.body as unknown as {
      isApp: boolean;
    };

    const paymentModel = this.Model.paymentModel();
    const invoice = await paymentModel.singleInvoice({
      id: Number(invoice_id),
      user_id,
    });

    if (!invoice.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: `Invoice does not exists`,
      };
    }

    let amount;
    if (
      invoice[0].due === invoice[0].total_amount &&
      (invoice[0].ref_type === "visa" || invoice[0].ref_type === "tour")
    ) {
      amount = Lib.getPaymentAmount(
        Number(invoice[0].due) * 0.2,
        SSL_PERCENTAGE
      );
    } else {
      amount = Lib.getPaymentAmount(invoice[0].due, SSL_PERCENTAGE);
    }

    if (invoice[0].ref_type === "flight") {
      const manualBankTransferModel = this.Model.manualBankTransferModel();

      const data = await manualBankTransferModel.getSingleManualBankTransfer({
        invoice_id: invoice_id,
        user_id: req.user.id,
        status: "pending",
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "A payment associated with this invoice is already pending.",
        };
      }
    }

    if (isApp) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: {
          tran_id: `${BTOC_PAYMENT_TYPE}-${invoice_id}`,
        },
      };
    }

    return await this.subServices.sslPayment({
      total_amount: amount as number,
      currency: "BDT",
      tran_id: `${BTOC_PAYMENT_TYPE}-${invoice_id}`,
      value_a: isApp,
      cus_name: first_name,
      cus_email: email,
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: phone_number,
      product_name: "st",
    });
  }

  // Create bKash payment
  public async createBkashPayment(req: Request, res: Response) {
    return await this.db.transaction(async (trx) => {
      try {
        const model = this.Model.paymentModel(trx);
        const { invoice_id, amount } = req.body;
        const { id: userId, phone_number } = req.user;

        const [invoice] = await model.singleInvoice({
          id: invoice_id,
        });
        if (!invoice) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Invoice not found",
          };
        }

        if (invoice.due <= 0) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "The invoice is already fully paid.",
          };
        }

        if (invoice.ref_type === "flight") {
          const manualBankTransferModel = this.Model.manualBankTransferModel();

          const data =
            await manualBankTransferModel.getSingleManualBankTransfer({
              invoice_id: invoice_id,
              user_id: req.user.id,
              status: "pending",
            });

          if (data.length) {
            return {
              success: false,
              code: this.StatusCode.HTTP_CONFLICT,
              message:
                "A payment associated with this invoice is already pending.",
            };
          }
        }

        const baseAmount = amount || invoice.due;

        const actual_amount = parseFloat(
          Lib.calculateAdjustedAmount(
            baseAmount,
            BKASH_PERCENTAGE,
            "add"
          ).toFixed(2)
        );

        const paymentBody = {
          mode: "0011",
          payerReference: phone_number,
          callbackURL: CALLBACK_URL,
          merchantAssociationInfo: config.MERCHANT_ASSOCIATION_INFO,
          amount: actual_amount.toString(),
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: invoice.invoice_number,
        };

        // Get bKash ID token
        const { data: tokenData } =
          await this.common_service.getBkashIdTokenByRefreshToken();

        console.log('tokenData', tokenData);

        const idToken = tokenData?.id_token;
        if (!idToken) throw new Error("Failed to retrieve bKash ID token.");

        // Send payment request to bKash
        const response = await axios.post(
          `${config.BKASH_BASE_URL}${CREATE_PAYMENT}`,
          paymentBody,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: idToken,
              "X-App-Key": config.BKASH_APP_KEY,
            },
          }
        );

        const responseData = response.data;

        // Check if bKash responded with success
        if (responseData.statusCode !== "0000") {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: `bKash payment initiation failed: ${responseData.statusMessage}`,
          };
        }

        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: responseData,
          message: "Payment created successfully.",
        };
      } catch (error) {
        console.error("Error creating bKash payment:", error);
        return {
          success: false,
          code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
          message: "Failed to create bKash payment.",
        };
      }
    });
  }

  //create ssl payment
  public async createSSLPayment(req: Request, res: Response) {
    return await this.db.transaction(async (trx) => {
      try {
        const model = this.Model.paymentModel(trx);
        const { invoice_id } = req.params as unknown as {
          invoice_id: number;
        };
        const { id: userId, phone_number, first_name, last_name, email } = req.user;
        const [invoice] = await model.singleInvoice({
          id: invoice_id,
          user_id: userId,
        });
        if (!invoice) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "Invoice not found",
          };
        }

        if (Number(invoice.due) <= 0) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "The invoice is already fully paid.",
          };
        }
        //SSL Service
        const sslService = new PublicSSLService();
        return await sslService.createSSLSession({
          total_amount: Lib.getPaymentAmount(invoice.due, SSL_PERCENTAGE),
          currency: 'BDT',
          tran_id: `b2c ${invoice.invoice_number} ${userId}`,
          cus_name: `${first_name} ${last_name}`,
          cus_email: email,
          cus_add1: 'Dhaka',
          cus_city: 'Dhaka',
          cus_country: 'Bangladesh',
          cus_phone: phone_number,
          product_name: 'payment',
          panel: 'b2c',
        });
      } catch (error) {
        console.error("Error creating payment:", error);
        throw new CustomError("Something went wrong. Please try again later.", this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
      }
    });
  }

  //get transaction
  public async getTransaction(req: Request) {
    const { id } = req.user;
    const model = this.Model.paymentModel();
    const { limit, skip, booking_id } = req.query;
    const data = await model.getTransactions(id, limit, skip, booking_id);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get invoice list
  public async getInvoice(req: Request) {
    const { id } = req.user;
    console.log({ id });
    const paymentModel = this.Model.paymentModel();
    const { limit, skip, due } = req.query;
    const data = await paymentModel.getInvoice({
      userId: id,
      limit,
      skip,
      due,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //single invoice
  public async singleInvoice(req: Request) {
    const { id: user_id } = req.user;
    console.log({ user_id });
    const { id: invoice_id } = req.params as unknown as { id: number };
    const paymentModel = this.Model.paymentModel();
    const data = await paymentModel.singleInvoice({ id: invoice_id, user_id });
    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: `Invoice not found`,
      };
    }

    let flight_data: any = {};
    let visa_data: any = {};
    let tour_data: any = {};
    let umrah_data: any = {};

    //get data if ref type is flight
    if (data[0].ref_type === "flight") {
      const flightModel = this.Model.btocFlightBookingModel();
      const flight_res = await flightModel.getSingleFlightBooking({
        id: data[0].ref_id,
      });
      const segment_data = await flightModel.getFlightSegment(data[0].ref_id);
      // let route: string = "";
      // segment_data.map((elem: any) => {
      //   route += elem.origin.split("-")[2] + " - ";
      // });
      // route += segment_data[segment_data.length - 1].destination.split("-")[2];

      flight_data = {
        base_fare: flight_res[0].base_fare,
        total_tax: flight_res[0].total_tax,
        ait: flight_res[0].ait,
        discount: flight_res[0].discount,
        pnr_code: flight_res[0].pnr_code,
        payable_amount: flight_res[0].payable_amount,
        journey_type: flight_res[0].journey_type,
        total_passenger: flight_res[0].total_passenger,
        route: flight_res[0].route,
      };
    }

    //get data if ref type is visa
    else if (data[0].ref_type === "visa") {
      const visaModel = this.Model.VisaModel();
      const visa_res = await visaModel.b2cSingleApplication(data[0].ref_id);

      visa_data = {
        country_name: visa_res.country_name,
        visa_fee: visa_res.visa_fee,
        processing_fee: visa_res.processing_fee,
        payable: visa_res.payable,
        total_passenger: visa_res.traveler,
      };
    }

    //get data if ref type is tour
    else if (data[0].ref_type === "tour") {
      const tourModel = this.Model.tourPackageBookingModel();
      const tour_res = await tourModel.getSingleBookingInfo(data[0].ref_id);
      // console.log({ tour_res });
      tour_data = {
        tour_name: tour_res.title,
        country_name: tour_res.country_name,
        traveler_adult: tour_res.traveler_adult,
        traveler_child: tour_res.traveler_child,
        adult_price: tour_res.adult_price,
        child_price: tour_res.child_price,
        discount: tour_res.discount,
        discount_type: tour_res.discount_type,
      };
    }
    //get data if ref type is umrah
    else if (data[0].ref_type === "umrah") {
      const umrahModel = this.Model.umrahPackageBookinModel();
      const umrah_res = await umrahModel.getSingleBooking(data[0].ref_id);
      // console.log({ umrah_res });
      umrah_data = {
        umrah_name: umrah_res.package_name,
        traveler_adult: umrah_res.traveler_adult,
        traveler_child: umrah_res.traveler_child,
        price_per_person: umrah_res.price_per_person,
        discount: umrah_res.discount,
        discount_type: umrah_res.discount_type,
      };
    }

    const money_receipt = await paymentModel.singleMoneyReceipt(invoice_id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        ...data[0],
        flight_data,
        visa_data,
        tour_data,
        umrah_data,
        money_receipt: money_receipt.length ? money_receipt : [],
      },
    };
  }
}
