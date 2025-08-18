import Joi from "joi";

export default class AdminB2bRegistrationRequestValidator {
  public updateRegistrationRequestValidator = Joi.object({
    state: Joi.string().valid("pending", "approved", "rejected").optional(),
    status: Joi.string().optional(),
    rejected_reason: Joi.string().optional(),
    commission_set_id: Joi.when("state", {
      is: "approved",
      then: Joi.number().required(),
      otherwise: Joi.number().optional(),
    }),
    kam_email: Joi.alternatives()
    .conditional('state', {
      is: 'approved',
      then: Joi.string().email().trim().lowercase().required(),
      otherwise: Joi.number().optional(),
    })
  });

  public registrationRequestQueryValidator = Joi.object({
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    key: Joi.string().optional(),
    state: Joi.string().valid("pending", "approved", "rejected").optional(),
    status: Joi.string().optional(),
  });
}
