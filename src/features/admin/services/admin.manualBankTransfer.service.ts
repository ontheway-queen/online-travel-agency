import { Request, Response } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { IGetBankTransferQuery } from "../../../utils/interfaces/btoc/manualBankTransferInteface";
import Lib from "../../../utils/lib/lib";
import { moneyReceiptTemplate } from "../../../utils/templates/moneyReceiptTemplate";
import { bankTransferSuccessTemplate } from "../../../utils/templates/bankTransferSuccessTemplate";
import { bankTransferRejectTemplate } from "../../../utils/templates/bankTransferRejectTemplate";

export class ManualBankTransferService extends AbstractServices {
  constructor() {
    super();
  }

  // get manual bank transfer list
  public async getManualBankTransferList(req: Request) {
    return this.db.transaction(async (trx) => {
      const model = this.Model.manualBankTransferModel(trx);
      const { status, limit, skip, from_date, to_date, user_id } =
        req.query as IGetBankTransferQuery;
      const data = await model.getManualBankTransferList({
        status,
        limit,
        skip,
        user_id,
        from_date,
        to_date,
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        total: data.total[0].total,
        data: data.data,
      };
    });
  }

  // get single manual bank transfer
  public async getSingleManualBankTransfer(req: Request) {
    return this.db.transaction(async (trx) => {
      const model = this.Model.manualBankTransferModel(trx);
      const { id } = req.params as unknown as { id: number };
      const data = await model.getSingleManualBankTransfer({
        id,
      });
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: data[0],
      };
    });
  }

  // update manual bank transfer
  public async updateManualBankTransfer(req: Request) {
    return this.db.transaction(async (trx) => {
      const model = this.Model.manualBankTransferModel(trx);
      const { id } = req.params as unknown as { id: number };

      const singleData = await model.getSingleManualBankTransfer({
        id,
      });

      if (!singleData.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const reqBody = {
        ...req.body,
      };

      if (
        singleData[0].status === "approved" ||
        singleData[0].status === "rejected"
      ) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: "Updates are not allowed after approval or rejection.",
        };
      }

      const updatedData = await model.updateManualBankTransfer(reqBody, id);

      const singleUser = await this.Model.userModel(trx).getProfileDetails({
        id: updatedData[0].user_id,
      });

      if (updatedData[0].status === "approved") {
        const paymentModel = this.Model.paymentModel(trx);

        const invoiceData = await paymentModel.singleInvoice(
          updatedData[0].invoice_id
        );

        const remainingDueAmount =
          invoiceData[0].due - updatedData[0].amount <= 0
            ? 0
            : invoiceData[0].due - updatedData[0].amount;

        await paymentModel.updateInvoice(
          { due: remainingDueAmount },
          invoiceData[0].id
        );

        if (invoiceData[0].ref_type === "flight") {
          const flightModel = this.Model.btocFlightBookingModel(trx);
          await flightModel.updateBooking(
            { status: "PROCESSING" },
            invoiceData[0].ref_id
          );
        } else if (invoiceData[0].ref_type === "visa") {
          const visaModel = this.Model.VisaModel(trx);
          await visaModel.b2cUpdateApplication(
            "PROCESSING",
            invoiceData[0].ref_id
          );
        } else if (invoiceData[0].ref_type === "tour") {
          const tourModel = this.Model.tourPackageBookingModel(trx);
          await tourModel.updateSingleBooking(invoiceData[0].ref_id, {
            status: "PROCESSING",
          });
        }

        const moneyRecipt = await paymentModel.createMoneyReceipt({
          invoice_id: invoiceData[0].id,
          amount: updatedData[0].amount,
          payment_time: updatedData[0].created_at,
          payment_type: updatedData[0].bank_name,
          details: "Payment has been made via manual bank transfer",
        });

        const moneyTransferSuccessMailData = {
          name: singleUser[0].first_name + " " + singleUser[0].last_name,
          referenceNumber: invoiceData[0].invoice_number,
          transferDate: new Date(updatedData[0].transfer_date)
            .toLocaleString()
            .split(",")[0],
          amount: updatedData[0].amount,
        };

        await Lib.sendEmail(
          singleUser[0].email,
          `Payment Verification Successfully Approved.`,
          bankTransferSuccessTemplate(moneyTransferSuccessMailData)
        );

        const moneyReceiptMailData = {
          name: singleUser[0].first_name + " " + singleUser[0].last_name,
          invoiceNumber: invoiceData[0].invoice_number,
          transactionId: "N/A",
          paymentTime: new Date(updatedData[0].created_at).toLocaleString(),
          amount: updatedData[0].amount,
          paymentMethod: updatedData[0].bank_name,
          paymentGateway: "Payment has been made via manual bank transfer",
        };

        await Lib.sendEmail(
          singleUser[0].email,
          `Money Receipt for Your Flight Booking ID : ${invoiceData[0].ref_id} | online travel agency`,
          moneyReceiptTemplate(moneyReceiptMailData)
        );
      }

      if (updatedData[0].status === "rejected") {
        const paymentModel = this.Model.paymentModel(trx);

        const invoiceData = await paymentModel.singleInvoice(
          updatedData[0].invoice_id
        );

        const moneyTransferRejectMailData = {
          name: singleUser[0].first_name + " " + singleUser[0].last_name,
          referenceNumber: invoiceData[0].invoice_number,
          transferDate: new Date(updatedData[0].transfer_date)
            .toLocaleString()
            .split(",")[0],
          amount: updatedData[0].amount,
        };

        await Lib.sendEmail(
          singleUser[0].email,
          `Payment Verification Failed.`,
          bankTransferRejectTemplate(moneyTransferRejectMailData)
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
