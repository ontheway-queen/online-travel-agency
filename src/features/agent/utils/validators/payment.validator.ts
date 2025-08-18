import Joi from "joi";

export class AgentPaymentValidator {
  public clearLoan = Joi.object({
    amount: Joi.number().required().min(1),
  });

  public createLoanRequest = Joi.object({
    amount: Joi.number().min(1).required(),
    details: Joi.string(),
  });

  public topupSchema = Joi.object({
    amount: Joi.number().required().min(10),
  });
}
