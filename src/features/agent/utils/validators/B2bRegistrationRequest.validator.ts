import Joi from "joi";

export default class B2bRegistrationRequestValidator {
  public registrationRequestValidator = Joi.object({
    name: Joi.string().max(255).required().trim(),
    agency_name: Joi.string().max(255).required().trim(),
    agency_phone: Joi.string().max(255).optional(),
    email: Joi.string().email().max(255).required().email().lowercase().trim(),
    mobile_number: Joi.string().max(255).optional(),
    address: Joi.string().optional(),
    postal_code: Joi.string().max(255),
  });

  public verifyRegistrationRequestValidator = Joi.object({
    otp: Joi.string().required(),
    email: Joi.string().email().max(255).lowercase().trim().required(),
    payload: Joi.object({
      name: Joi.string().max(255).required(),
      email: Joi.string().email().max(255).lowercase().trim().required(),
      mobile_number: Joi.string().max(255).allow(""),
      address: Joi.string().allow(""),
      postal_code: Joi.string().allow(""),
      agency_name: Joi.string().required(),
      agency_phone: Joi.string().allow(""),
      agency_email: Joi.string().allow("").lowercase().trim(),
      agency_logo: Joi.string().allow(""),
      photo: Joi.string().allow(""),
      trade_license: Joi.string().allow(""),
      visiting_card: Joi.string().allow(""),
    }).required(),
  });
}
