import Joi from "joi";

export class BtobValidator {
  //insert deposit
  public insertDeposit = Joi.object({
    bank_name: Joi.string().optional(),
    amount: Joi.number().required(),
    payment_date: Joi.date().required(),
    remarks: Joi.string().optional(),
  });

  public searchHistoryValidator = Joi.object({
    from_date: Joi.date().iso().optional(),
    to_date: Joi.date().iso().optional(),
    limit: Joi.number().integer().optional(),
    skip: Joi.number().integer().optional(),
    type: Joi.string().required().valid("flight", "tour", "visa", "umrah"),
  });
}
