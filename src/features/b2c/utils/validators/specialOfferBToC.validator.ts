import Joi from "joi";

class SpecialOfferBToCValidator {
  public getSpecialOfferQuery = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    key: Joi.string().optional(),
    type: Joi.string().optional(),
    status: Joi.string().valid("ACTIVE", "INACTIVE"),
  });
}

export default SpecialOfferBToCValidator;
