import { Request, Response } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { BookingPaymentService } from "./subServices/payment.service";
import {
  ADMIN_URL,
  B2b_CALLBACK_URL,
  CREDIT_LOAD,
  INVOICE_TYPE_FLIGHT,
  LOAN_TYPE,
  PROJECT_EMAIL_ACCOUNT_1,

  PROJECT_EMAIL_API_1,
  PROJECT_IMAGE_URL,
  SSL_PERCENTAGE,
} from "../../../utils/miscellaneous/constants";
import Lib from "../../../utils/lib/lib";
import {
  template_onInvoiceDueClear_send_to_admin,
  template_onInvoiceDueClear_send_to_agent,
} from "../../../utils/templates/invoiceTemplate";
import {
  template_onLoanGiven_send_to_admin,
  template_onLoanRepayment_send_to_admin,
  template_onLoanRepayment_send_to_agency,
  template_onLoanRequest_send_to_admin,
} from "../../../utils/templates/loanTemplate";
import config from "../../../config/config";
import PublicCommonBkashService from "../../public/services/publicBkash.service";
import axios, { AxiosRequestConfig } from "axios";
import { CREATE_PAYMENT } from "../../../utils/miscellaneous/bkashApiEndpoints";
import CustomError from "../../../utils/lib/customError";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";
import PublicSSLService from "../../public/services/publicSSL.service";
export class BookingPaymentServices extends AbstractServices {
  private subServices = new BookingPaymentService();
  private bkashPaymentService = new PublicCommonBkashService();

  //create payment
  public async CreateB2bBkashPayment(req: Request, res: Response) {
    return await this.db.transaction(async (trx) => {
      try {
        const { id, name, email, mobile_number, agency_id } = req.agency;
        const { amount } = req.body;
        if (!amount) {
          throw new CustomError(
            "Give an amount to continue",
            this.StatusCode.HTTP_UNPROCESSABLE_ENTITY
          );
        }

        // Prepare payment request body
        const paymentBody = {
          mode: "0011",
          payerReference: mobile_number,
          callbackURL: B2b_CALLBACK_URL,
          merchantAssociationInfo: config.MERCHANT_ASSOCIATION_INFO,
          amount: amount.toString(),
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: `${CREDIT_LOAD}-${agency_id}-${id}`,
        };

        // Retrieve authorization token for bKash
        const { data: token_Data } =
          await this.bkashPaymentService.getBkashIdTokenByRefreshToken();
        if (!token_Data?.id_token) {
          throw new Error("Failed to retrieve bKash ID token.");
        }

        const axiosConfig: AxiosRequestConfig = {
          method: "POST",
          url: `${config.BKASH_BASE_URL}${CREATE_PAYMENT}`,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token_Data.id_token,
            "X-App-Key": config.BKASH_APP_KEY,
          },
          data: JSON.stringify(paymentBody),
        };

        // Send payment request to bKash
        const response = await axios.request(axiosConfig);

        // Check response and return formatted data
        const { data } = response;

        if (data.statusCode !== "0000") {
          return {
            success: false,
            code: this.StatusCode.HTTP_BAD_REQUEST,
            message: `bKash payment initiation failed: ${data.statusMessage}`,
          };
        }

        // Success: Return response data with success status
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data,
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
  public async createSSLPayment(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, agency_name, email, mobile_number } = req.agency;
      const sslService = new PublicSSLService();
      const { amount } = req.body;
      return await sslService.createSSLSession({
        total_amount: Lib.getPaymentAmount(amount, SSL_PERCENTAGE),
        currency: 'BDT',
        tran_id: `agency-${agency_id}`,
        cus_name: agency_name,
        cus_email: email,
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        cus_phone: mobile_number,
        product_name: 'top-up',
        panel: 'b2b',
      });
    });
  }

  //get transaction
  public async getTransaction(req: Request) {
    const { agency_id } = req.agency;
    const model = this.Model.agencyModel();
    const { limit, skip, from_date, to_date, type } = req.query;
    const data = await model.getAgencyTransactions({
      agency_id,
      start_date: from_date as string,
      end_date: to_date as string,
      limit: parseInt(limit as string),
      skip: parseInt(skip as string),
      type: type as string,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get invoice
  public async getInvoice(req: Request) {
    const { agency_id } = req.agency;
    const model = this.Model.btobPaymentModel();
    const query = req.query;
    query.agency_id = agency_id.toString();
    const data = await model.getInvoice(query);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single invoice
  public async getSingleInvoice(req: Request) {
    const { agency_id } = req.agency;
    const model = this.Model.btobPaymentModel();
    const { id: invoice_id } = req.params;
    const data = await model.singleInvoice(Number(invoice_id), agency_id);

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "the invoice not found",
      };
    }

    let flight_data: any = {};

    if (data[0].ref_type === INVOICE_TYPE_FLIGHT) {
      const flightModel = this.Model.b2bFlightBookingModel();
      const flight_res = await flightModel.getSingleFlightBooking({
        id: data[0].ref_id,
      });

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

    const money_receipt = await model.getMoneyReceipt(Number(invoice_id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        ...data[0],
        flight_data,
        money_receipt: money_receipt.length ? money_receipt : [],
      },
    };
  }

  //clear invoice due
  public async clearInvoiceDue(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, id: user_id, email: user_email } = req.agency;
      const paymentModel = this.Model.btobPaymentModel(trx);
      const agencyModel = this.Model.agencyModel(trx);
      const { id: invoice_id } = req.params;
      const checkInvoice = await paymentModel.singleInvoice(
        Number(invoice_id),
        agency_id
      );
      if (!checkInvoice.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      const due = Number(checkInvoice[0].due);
      if (due <= 0) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "No due has been found with this invoice",
        };
      }

      //check balance
      const agencyBalance = await agencyModel.getTotalBalance(agency_id);
      if (Number(agencyBalance) < due) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "There is insufficient balance in your account",
        };
      }

      //debit amount from the agency
      await agencyModel.insertAgencyLedger({
        agency_id: agency_id,
        type: "debit",
        amount: due,
        details: `Due has been cleared for invoice id ${checkInvoice[0].invoice_number}`,
      });

      //clear due
      await paymentModel.updateInvoice({ due: 0 }, Number(invoice_id));

      //create money receipt
      await paymentModel.createMoneyReceipt({
        amount: due,
        invoice_id: Number(invoice_id),
        details: `due has been cleared for invoice ${checkInvoice[0].invoice_number}`,
        user_id: user_id,
      });

      // send email notification
      await Promise.all([
        Lib.sendEmail(
          [
            PROJECT_EMAIL_ACCOUNT_1,
      
          ],
          `Invoice due of BDT ${due} has been cleared for ${checkInvoice[0].agency_name}`,
          template_onInvoiceDueClear_send_to_admin({
            title: "Invoice Due Cleared",
            amount: due,
            clearanceTime: new Date().toLocaleString(),
            remarks: `Due has been cleared for invoice ${checkInvoice[0].invoice_number}`,
            agency_name: checkInvoice[0].agency_name,
          })
        ),
        Lib.sendEmail(
          user_email,
          `Your invoice due of BDT ${due} has been cleared`,
          template_onInvoiceDueClear_send_to_agent({
            title: "Invoice Due Cleared",
            amount: due,
            clearanceTime: new Date().toLocaleString(),
            remarks: `Due has been cleared for invoice ${checkInvoice[0].invoice_number}`,
            agency_name: checkInvoice[0].agency_name,
          })
        ),
      ]);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Due has been cleared for this invoice",
      };
    });
  }

  // b2b partial payment list
  public async getPartialPaymentList(req: Request) {
    const model = this.Model.btobPaymentModel();
    const { agency_id } = req.agency;
    const query = req.query;
    const { data, total } = await model.getPartialPaymentInvoiceList({
      ...query,
      agency_id,
    });
    const { total_due } = await model.getPartialPaymentTotalDue({
      ...query,
      agency_id,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
      total_due,
    };
  }

  // partial payment due
  public async getPartialPaymentTotalDue(req: Request) {
    const model = this.Model.btobPaymentModel();
    const { agency_id } = req.agency;
    const query = req.query;

    const { total_due } = await model.getPartialPaymentTotalDue({
      ...query,
      agency_id,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        total_due,
      },
    };
  }

  //clear loan
  public async clearLoan(req: Request) {
    return await this.db.transaction(async (trx) => {
      const body = req.body;
      const { agency_id } = req.agency;
      const model = this.Model.AgencyLoanModel(trx);
      const agencyModel = this.Model.agencyModel(trx);
      const getAgency = await agencyModel.getSingleAgency(agency_id);
      if (getAgency[0].loan < body.amount) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Loan amount exceeds agency's current loan.",
        };
      }

      //check balance
      const currentBalance = await agencyModel.getTotalBalance(agency_id);
      if (currentBalance < body.amount) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Insufficient balance to adjust the loan.",
        };
      }

      //update loan data
      await agencyModel.updateAgency(
        {
          loan: Number(getAgency[0].loan) - Number(body.amount),
        },
        agency_id
      );

      // Insert loan adjustment data
      await model.insertAgencyLoan({
        agency_id: agency_id,
        amount: body.amount,
        type: LOAN_TYPE.repayment,
        details: "Loan has been paid by the agency",
        date: new Date(),
      });

      //insert balance
      await agencyModel.insertAgencyLedger({
        agency_id: agency_id,
        amount: body.amount,
        type: "debit",
        details: "Loan repayment by the agency",
      });

      // send email notification
      await Promise.all([
        Lib.sendEmail(
          getAgency[0].email,
          `Loan of BDT ${body.amount} has been adjusted from your agency`,
          template_onLoanRepayment_send_to_agency({
            title: "Loan Repayment",
            amount: body.amount,
            repaymentDate: new Date().toLocaleString(),
            remarks: body.details,
            agency_name: getAgency[0].agency_name,
            logo: `${PROJECT_IMAGE_URL}/getAgency[0].agency_logo`,
          })
        ),
        Lib.sendEmail(
          [
            PROJECT_EMAIL_ACCOUNT_1,
      
          ],
          `Loan of BDT ${body.amount} has been adjusted from agency ${getAgency[0].agency_name}`,
          template_onLoanRepayment_send_to_admin({
            title: "Loan Repayment",
            amount: body.amount,
            repaymentDate: new Date().toLocaleString(),
            remarks: body.details,
            agency_name: getAgency[0].agency_name,
            logo: `${PROJECT_IMAGE_URL}/getAgency[0].agency_logo`,
          })
        ),
      ]);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Loan adjusted successfully.",
      };
    });
  }

  //create deposit order by brac gateway
  public async createDepositOrderByBracGateway(req: Request) {
    const getLastAgencyTransaction =
      await this.Model.agencyModel().getLastAgencyTransaction();

    const ref_id = `${Lib.generateAlphaNumericCode(9)}${parseInt(getLastAgencyTransaction.id) + 1
      }`;

    console.log({ ref_id });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ref_id,
        agency_id: req.agency.agency_id,
      },
    };
  }

  //================================== LOAN REQUEST =========================================
  //create loan request
  public async createLoanRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, id: user_id, agency_name, agency_logo } = req.agency;
      const model = this.Model.AgencyLoanModel(trx);
      const agencyModel = this.Model.agencyModel(trx);
      const check_pending_loan = await model.getLoanRequest({
        agency_id,
        status: "Pending",
      });
      if (check_pending_loan.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            "There is already a pending loan request. Contact the support team to know more info",
        };
      }

      const agency = await agencyModel.getSingleAgency(agency_id);
      const body = req.body;
      body.agency_id = agency_id;
      body.created_by = user_id;
      await model.createLoanRequest(body);

      const logoUrl = `${PROJECT_IMAGE_URL}/${agency[0].agency_logo}`;
      const formattedDate = new Date().toLocaleString();

      await Lib.sendEmail(
        [
          PROJECT_EMAIL_ACCOUNT_1
        ],
        `Loan Request of BDT ${body.amount} submitted by - ${agency_name}`,
        template_onLoanRequest_send_to_admin({
          title: "Loan Request",
          amount: body.amount,
          date: formattedDate,
          remarks: `'${agency_name}' has submitted a loan request for BDT ${body.amount}`,
          agency_name: agency_name,
          logo: logoUrl,
          admin_url: ADMIN_URL,
        })
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Loan request has been submitted",
      };
    });
  }

  //get loan request
  public async getLoanRequest(req: Request) {
    const { agency_id } = req.agency;
    const model = this.Model.AgencyLoanModel();
    const query = req.query;
    const data = await model.getLoanRequest({ ...query, agency_id }, true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get loan history
  public async getLoanHistory(req: Request) {
    const { agency_id } = req.agency;
    const model = this.Model.AgencyLoanModel();
    const query = req.query;
    const data = await model.getAllLoanHistory({ ...query, agency_id });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }
}
