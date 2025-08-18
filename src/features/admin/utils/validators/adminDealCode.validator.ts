import Joi from "joi";
import {
  SABRE_API,
  TRIPJACK_API,
  VERTEIL_API,
} from "../../../../utils/miscellaneous/flightMiscellaneous/flightConstants";

export class AdminDealCodeValidator {
  public create = Joi.object({
    deal_code: Joi.string().required(),
    api: Joi.string().required().valid(VERTEIL_API, SABRE_API),
  });

  public update = Joi.object({
    deal_code: Joi.string().required(),
    status: Joi.boolean(),
  });

  public get = Joi.object({
    api: Joi.string(),
    status: Joi.boolean(),
    limit: Joi.number(),
    skip: Joi.number(),
  });
}
