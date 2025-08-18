import Joi from 'joi';

export class ManualBankTransferValidator {
  // create manual bank transfer
  public createManualBankTransferSchema = Joi.object({
    invoice_id: Joi.string().required(),
    amount: Joi.string().required(),
    bank_name: Joi.string().required(),
    account_number: Joi.string().optional(),
    account_name: Joi.string().optional(),
    transfer_date: Joi.string().optional(),
  });

  // get manual bank transfer
  public getManualBankTransferSchema = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
    status: Joi.string().optional(),
    amount: Joi.number().optional(),
  });

  // update manual bank transfer
  public updateManualBankTransferSchema = Joi.object({
    amount: Joi.number().optional(),
    bank_name: Joi.string().optional(),
    account_number: Joi.string().optional(),
    account_name: Joi.string().optional(),
    transfer_date: Joi.date().optional(),
  });
}
