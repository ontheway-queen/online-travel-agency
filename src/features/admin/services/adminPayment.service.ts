import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import {
  INVOICE_TYPE_FLIGHT,
  LOAN_TYPE,
  PANEL_TYPE,
  PROJECT_CODE,
  PROJECT_EMAIL_ACCOUNT_1,
  PROJECT_IMAGE_URL,
} from "../../../utils/miscellaneous/constants";
import Lib from "../../../utils/lib/lib";
import {
  template_onInvoiceDueClear_send_to_admin,
  template_onInvoiceDueClear_send_to_agent,
} from "../../../utils/templates/invoiceTemplate";
import {
  template_onLoanGiven_send_to_admin,
  template_onLoanGiven_send_to_agency,
  template_onLoanRepayment_send_to_admin,
  template_onLoanRepayment_send_to_agency,
} from "../../../utils/templates/loanTemplate";
import { sendEmailOtpTemplate } from "../../../utils/templates/sendEmailOtp";
import config from "../../../config/config";
import { mode } from "crypto-ts";
import { AgencyNotificationSubService } from "../../agent/services/subServices/agencyNotificationSubService";

export class PaymentService extends AbstractServices {
  constructor() {
    super();
  }

  //Get Invoice List B2C
  public async getB2CInvoiceList(req: Request) {
    const paymentModel = this.Model.paymentModel();
    const { limit, skip, due, userId } = req.query;
    const data = await paymentModel.getInvoice({
      limit,
      skip,
      due,
      userId: Number(userId),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single invoice B2C
  public async getB2CSingleInvoice(req: Request) {
    const { id: invoice_id } = req.params as unknown as { id: number };
    const paymentModel = this.Model.paymentModel();
    const data = await paymentModel.singleInvoice({ id: invoice_id });

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
    } else if (data[0].ref_type === "umrah") {
      const umrahModel = this.Model.umrahPackageBookinModel();
      const umrah_res = await umrahModel.getSingleBooking(data[0].ref_id);

      umrah_data = {
        package_name: umrah_res.package_name,
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

  //get invoice B2B
  public async getB2BInvoice(req: Request) {
    const model = this.Model.btobPaymentModel();
    const query = req.query;
    const data = await model.getInvoice(query);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single invoice B2B
  public async getB2BSingleInvoice(req: Request) {
    const model = this.Model.btobPaymentModel();
    const { id: invoice_id } = req.params;
    const data = await model.singleInvoice(Number(invoice_id));
    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
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

  // b2b partial payment list
  public async getPartialPaymentList(req: Request) {
    const model = this.Model.btobPaymentModel();
    const query = req.query;
    const { data, total } = await model.getPartialPaymentInvoiceList(query);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total,
      data,
    };
  }

  // loan
  public async giveAgencyLoan(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id } = req.admin;
      const body = req.body;
      const agencyModel = this.Model.agencyModel(trx);
      const model = this.Model.AgencyLoanModel(trx);
      const getAgency = await agencyModel.getSingleAgency(body.agency_id);
      if (!getAgency.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Agency not found.",
        };
      }

      body.loan_given_by = id;
      body.type = LOAN_TYPE.loan;

      // Insert loan data
      await model.insertAgencyLoan(body);

      //insert balance
      await agencyModel.insertAgencyLedger({
        agency_id: body.agency_id,
        amount: body.amount,
        type: "credit",
        details: body.details,
      });

      //update agency

      await agencyModel.updateAgency(
        { loan: Number(getAgency[0].loan) + Number(body.amount) },
        body.agency_id
      );

      // send email notification
      await Promise.all([
        Lib.sendEmail(
          getAgency[0].email,
          `Loan of BDT ${body.amount} has been given to your agency`,
          template_onLoanGiven_send_to_agency({
            title: "Loan Given",
            amount: body.amount,
            date: new Date().toLocaleString(),
            remarks: body.details,
            agency_name: getAgency[0].agency_name,
            logo: `${PROJECT_IMAGE_URL}/getAgency[0].agency_logo`,
          })
        ),
        Lib.sendEmail(
          [
            PROJECT_EMAIL_ACCOUNT_1
          ],
          `Loan of BDT ${body.amount} has been given to - ${getAgency[0].agency_name}`,
          template_onLoanGiven_send_to_admin({
            title: "Loan Given",
            amount: body.amount,
            date: new Date().toLocaleString(),
            remarks: body.details,
            agency_name: getAgency[0].agency_name,
            logo: `${PROJECT_IMAGE_URL}/getAgency[0].agency_logo`,
          })
        ),
      ]);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Loan given successfully.",
      };
    });
  }

  //get only loan agencies
  public async getAgenciesWithLoan(req: Request) {
    const query = req.query as any;
    query.loan = true; // filter agencies with loan
    const agencyModel = this.Model.agencyModel();
    const { data, total } = await agencyModel.getAgency(query);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  //get agency loan history
  public async getAgencyLoanHistory(req: Request) {
    const model = this.Model.AgencyLoanModel();
    const { from_date, to_date, limit, skip, agency_id, type } =
      req.query as any;

    const params = {
      from_date,
      to_date,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
      agency_id,
      type,
    };

    const data = await model.getAllLoanHistory(params);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //adjust loan
  public async adjustAgencyLoan(req: Request) {
    return await this.db.transaction(async (trx) => {
      const body = req.body;
      const agencyModel = this.Model.agencyModel(trx);
      const model = this.Model.AgencyLoanModel(trx);
      const getAgency = await agencyModel.getSingleAgency(body.agency_id);
      if (!getAgency.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Agency not found.",
        };
      }

      if (getAgency[0].loan < body.amount) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Loan amount exceeds agency's current loan.",
        };
      }

      //check balance
      const currentBalance = await agencyModel.getTotalBalance(body.agency_id);
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
        body.agency_id
      );
      await agencyModel.updateAgency(
        {
          loan: Number(getAgency[0].loan) - Number(body.amount),
        },
        body.agency_id
      );

      // Insert loan adjustment data
      await model.insertAgencyLoan({
        agency_id: body.agency_id,
        amount: body.amount,
        type: LOAN_TYPE.repayment,
        details: body.details,
        date: body.date || new Date(),
      });

      //insert balance
      await agencyModel.insertAgencyLedger({
        agency_id: body.agency_id,
        amount: body.amount,
        type: "debit",
        details: body.details,
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

  //=============================== Loan Request ============================//
  //get loan request
  public async getLoanRequest(req: Request) {
    const model = this.Model.AgencyLoanModel();
    const query = req.query;
    const data = await model.getLoanRequest({ ...query }, true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //update loan req
  public async updateLoanRequest(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id: adminId } = req.admin;
      const { id: requestId } = req.params;
      const body = req.body;

      const loanModel = this.Model.AgencyLoanModel();
      const agencyModel = this.Model.agencyModel(trx);

      const loanRequest = await loanModel.getLoanRequest({
        id: Number(requestId),
      });
      const requestData = loanRequest.data[0];

      if (!requestData) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (requestData.status !== "Pending") {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Cannot update this request",
        };
      }

      const agencyData = await agencyModel.getSingleAgency(
        requestData.agency_id
      );
      const agency = agencyData[0];

      if (!agency) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Agency not found.",
        };
      }

      await loanModel.updateLoanRequest(body, Number(requestId));

      if (body.status === "Approved") {
        const loanAmount = requestData.amount;
        const agencyId = requestData.agency_id;
        const approvalNote =
          body.note ||
          `Loan request has been approved for the agency: '${agency.email}'`;

        const loanDetails = {
          loan_given_by: adminId,
          type: LOAN_TYPE.loan,
          agency_id: agencyId,
          amount: loanAmount,
          date: new Date(new Date().toDateString()),
          details: approvalNote,
        };

        await loanModel.insertAgencyLoan(loanDetails);

        await agencyModel.insertAgencyLedger({
          agency_id: agencyId,
          amount: loanAmount,
          type: "credit",
          details: approvalNote,
        });

        const updatedLoan = Number(agency.loan) + Number(loanAmount);
        await agencyModel.updateAgency({ loan: updatedLoan }, agencyId);

        const logoUrl = `${PROJECT_IMAGE_URL}/${agency.agency_logo}`;
        const formattedDate = new Date().toLocaleString();

        await Promise.all([
          Lib.sendEmail(
            agency.email,
            `Loan of BDT ${loanAmount} has been given to your agency`,
            template_onLoanGiven_send_to_agency({
              title: "Loan Given",
              amount: loanAmount,
              date: formattedDate,
              remarks: approvalNote,
              agency_name: agency.agency_name,
              logo: logoUrl,
            })
          ),
          Lib.sendEmail(
            [
              PROJECT_EMAIL_ACCOUNT_1
            ],
            `Loan of BDT ${loanAmount} has been given to - ${agency.agency_name}`,
            template_onLoanGiven_send_to_admin({
              title: "Loan Given",
              amount: loanAmount,
              date: formattedDate,
              remarks: approvalNote,
              agency_name: agency.agency_name,
              logo: logoUrl,
            })
          ),
        ]);

        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          message: "Loan request has been approved and processed.",
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: "Loan request has been updated.",
      };
    });
  }

  public async clearPartialPaymentDue(req: Request) {
    return await this.db.transaction(async (trx) => {
      const paymentModel = this.Model.btobPaymentModel(trx);
      const agencyModel = this.Model.agencyModel(trx);
      const { id: invoice_id } = req.params;
      const checkInvoice = await paymentModel.singleInvoice(Number(invoice_id));

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
      const agencyBalance = await agencyModel.getTotalBalance(
        checkInvoice[0].agency_id
      );

      if (Number(agencyBalance) < due) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "There is insufficient balance in your account",
        };
      }

      //debit amount from the agency
      await agencyModel.insertAgencyLedger({
        agency_id: checkInvoice[0].agency_id,
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
          checkInvoice[0].agency_email,
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
        message: "Partial payment due has been cleared successfully.",
      };
    });
  }

  // payment link
  public async createPaymentLink(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.commonModel(trx);
      const paymentModel = this.Model.paymentModel(trx);
      const { id } = req.admin;

      const body = req.body;
      body.created_by = id;

      if (body.link_type === PANEL_TYPE.b2c) {
        const invoice_data = await paymentModel.getLastInvoice({});

        let invoice_number: any = 0;

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

        const invoice = await paymentModel.insertInvoice({
          user_id: body.target_id,
          ref_type: "payment-link",
          total_amount: body.amount,
          due: body.amount,
          details: `An invoice has been created for the payment link`,
          invoice_number,
        });

        body.invoice_id = invoice[0].id;
      }

      const res = await model.insertPaymentLink(body);

      const singlePaymentLink = await model.getSinglePaymentLink({
        id: res[0].id,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          ...res[0],
          invoice_number: singlePaymentLink.invoice_number,
          target_name: singlePaymentLink.target_name,
        },
      };
    });
  }

  // get payment link
  public async getAllPaymentLink(req: Request) {
    const model = this.Model.commonModel();

    const query = req.query as unknown as {
      link_type: "b2b" | "b2c";
      target_id: number;
      amount?: number;
      invoice_id?: string;
      created_by: number;
    };

    const data = await model.getAllPaymentLinks(query);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
    };
  }
}
