import Joi from "joi";

export class AdminAgencyValidator {
  // create agency schema
  public createAgencySchema = Joi.object({
    agency_email: Joi.string().email().lowercase().trim().required(),
    agency_phone: Joi.string().required(),
    agency_name: Joi.string().required(),
    // commission: Joi.number().min(0).max(12).required(),
    user_name: Joi.string().required(),
    user_email: Joi.string().email().lowercase().trim().required(),
    user_password: Joi.string().required(),
    user_phone: Joi.string().required(),
    commission_set_id: Joi.number().required(),
    address: Joi.string().required(),
    kam_email: Joi.string().email().trim().lowercase().optional()
  });

  // update agency schema
  public updateAgencySchema = Joi.object({
    email: Joi.string().email().lowercase().trim().optional(),
    phone: Joi.string().optional(),
    agency_name: Joi.string().optional(),
    commission: Joi.number().min(0).optional(),
    status: Joi.number().valid("true", "false").optional(),
    commission_set_id: Joi.number().optional(),
    address: Joi.string().optional(),
    kam_email: Joi.string().email().trim().lowercase().optional()
  });

  // create agency user schema
  public createAgencyUserSchema = Joi.object({
    agency_id: Joi.number().required(),
    name: Joi.string().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
    mobile_number: Joi.string().min(11).max(14).required(),
  });

  // update agency user schema
  public updateAgencyUserSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    mobile_number: Joi.string().min(11).max(14).optional(),
    status: Joi.number().valid(0, 1).optional(),
  });

  //deposit to agency schema
  public depositToAgencySchema = Joi.object({
    agency_id: Joi.number().required(),
    type: Joi.string().valid("credit", "debit").required(),
    amount: Joi.number().required(),
    details: Joi.string().optional(),
  });
}
