import Joi from "joi";

class SpecialOfferValidator {
  public createSpecialOffer = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    type: Joi.string().max(255).optional(),
    description: Joi.string().optional(),
    panel: Joi.string().valid("B2B","B2C","ALL").required()
  });

  public updateSpecialOffer = Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    type: Joi.string().max(255).optional(),
    description: Joi.string().optional(),
    status: Joi.string()
      .valid("ACTIVE", "INACTIVE")
      .messages({
        "any.only": "Status must be either ACTIVE or INACTIVE",
      })
      .optional(),
      panel: Joi.string().valid("B2B","B2C","ALL").optional()
  });

  public getSpecialOfferQuery = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    key: Joi.string().optional(),
    type: Joi.string().optional(),
    status: Joi.string().optional(),
    panel: Joi.string().optional()
  });
}

export default SpecialOfferValidator;
