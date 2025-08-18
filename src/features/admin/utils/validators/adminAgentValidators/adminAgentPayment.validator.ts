import Joi from "joi";

export class AdminAgentPaymentValidator {
  public giveAgencyLoanValidator = Joi.object({
    agency_id: Joi.number().required(),
    amount: Joi.number().required(),
    details: Joi.string().optional().allow(""),
    date: Joi.date().required(),
  });

  public adjustAgencyLoanValidator = Joi.object({
    agency_id: Joi.number().required(),
    amount: Joi.number().required(),
    details: Joi.string().optional().allow(""),
    date: Joi.date().optional(),
  });

  public getLoanRequestQuery = Joi.object({
    limit: Joi.number(),
    skip: Joi.number(),
    status: Joi.string().valid("Pending", "Approved", "Rejected"),
    agency_id: Joi.number(),
    from_date: Joi.date(),
    to_date: Joi.date(),
  });

  public updateLoanReq = Joi.object({
    status: Joi.string().valid("Approved", "Rejected").required(),
    note: Joi.string().optional(),
  });
}
