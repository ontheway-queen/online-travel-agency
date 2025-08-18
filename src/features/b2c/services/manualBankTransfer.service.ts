import { Request, Response } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { IGetBankTransferQuery } from '../../../utils/interfaces/btoc/manualBankTransferInteface';
import Lib from '../../../utils/lib/lib';
import { bankTransferSubmissionTemplate } from '../../../utils/templates/bankTransferSubmissionTemplate';
import { AdminNotificationSubService } from '../../admin/services/subServices/adminNotificationSubService';
import { NOTIFICATION_TYPE_B2C_BANK_TRANSFER } from '../../../utils/miscellaneous/constants';

export class ManualBankTransferService extends AbstractServices {
  constructor() {
    super();
  }

  // create manual bank transfer
  public async createManualBankTransfer(req: Request) {
    return this.db.transaction(async (trx) => {
      const manualBankTransferModel = this.Model.manualBankTransferModel(trx);

      const { id: user_id, email } = req.user;
      const file = req.files as Express.Multer.File[];

      if (!file.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
          message: "Please provide the bank receipt"
        }
      }

      const reqBody = {
        invoice_copy: file[0].filename,
        user_id,
        ...req.body,
      };

      const data = await manualBankTransferModel.getSingleManualBankTransfer({
        invoice_id: req.body.invoice_id,
        user_id: req.user.id,
        status: 'pending',
      });

      if (data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            'A bank transfer with the same invoice already in pending state.',
        };
      }

      const res = await manualBankTransferModel.createManualBankTransfer(reqBody);

      await Lib.sendEmail(
        email,
        'Your Payment is Under Review',
        bankTransferSubmissionTemplate()
      );

      //send notification to admin
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      await adminNotificationSubService.insertNotification({ message: `A new manual bank transfer request from B2C. Amount - ${req.body.amount}`, ref_id: res[0].id, type: NOTIFICATION_TYPE_B2C_BANK_TRANSFER });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message:
          'Your bank transfer request has been successfully submitted. Please wait for the Verification.',
      };
    });
  }

  // get manual bank transfer list
  public async getManualBankTransferList(req: Request) {
    return this.db.transaction(async (trx) => {
      const model = this.Model.manualBankTransferModel(trx);
      const { id } = req.user;
      const { status, limit, skip, from_date, to_date } =
        req.query as IGetBankTransferQuery;
      const data = await model.getManualBankTransferList({
        status,
        limit,
        skip,
        user_id: id,
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

  //get single manual bank transfer
  public async getSingleManualBankTransfer(req: Request) {
    return this.db.transaction(async (trx) => {
      const model = this.Model.manualBankTransferModel(trx);
      const { id } = req.params as unknown as { id: number };
      const data = await model.getSingleManualBankTransfer({
        id,
        user_id: req.user.id,
      });
      if (!data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        data: data[0],
      };
    });
  }

  public async updateManualBankTransfer(req: Request) {
    return this.db.transaction(async (trx) => {
      const model = this.Model.manualBankTransferModel(trx);
      const { id } = req.params as unknown as { id: number };

      const file = req.files as Express.Multer.File[];

      const singleData = await model.getSingleManualBankTransfer({
        id,
        user_id: req.user.id,
      });

      if (!singleData.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      if (singleData[0].status !== 'pending') {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Updates are not allowed after approval or rejection.',
        };
      }

      const reqBody = {
        ...req.body,
      };

      if (file?.length) {
        reqBody.invoice_copy = file[0].filename;
        const invoice_image = singleData[0].invoice_copy;
        await this.manageFile.deleteFromCloud([invoice_image]);
      }

      await model.updateManualBankTransfer(reqBody, id);

      //send notification to admin
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      await adminNotificationSubService.insertNotification({ message: `A manual bank transfer has been updated from B2C`, ref_id: Number(id), type: NOTIFICATION_TYPE_B2C_BANK_TRANSFER });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
