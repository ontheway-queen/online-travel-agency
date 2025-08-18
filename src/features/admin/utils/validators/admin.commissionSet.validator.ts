import Joi from "joi";

export default class AdminCommissionSetValidator {
  // create Commission set
  public createCommissionSetSchema = Joi.object({
    name: Joi.string().required(),
    api: Joi.array()
      .items(
        Joi.object({
          api_id: Joi.number().required(),
          airlines: Joi.array()
            .min(1)
            .items(Joi.string().length(2).required())
            .required(),
          com_domestic: Joi.number().required(),
          com_from_dac: Joi.number().required(),
          com_to_dac: Joi.number().required(),
          com_soto: Joi.number().required(),
          com_type: Joi.string().valid("PER", "FLAT").required(),
          com_mode: Joi.string().valid("INCREASE", "DECREASE").required(),
          booking_block: Joi.boolean().optional(),
          issue_block: Joi.boolean().optional(),
        })
      )
      .min(1)
      .optional(),
  });

  // Get Commission set schema
  public getCommissionSetSchema = Joi.object({
    name: Joi.string().optional(),
    status: Joi.boolean().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
  });

  // Update commission set schema
  public updateCommissionSetSchema = Joi.object({
    name: Joi.string().optional(),
    add: Joi.array().items(Joi.number().required()).optional(),
    update: Joi.array().items(
      Joi.object({
        id: Joi.number().required(),
        status: Joi.boolean().required(),
        booking_block: Joi.boolean().optional(),
        issue_block: Joi.boolean().optional(),
      })
    ),
  });

  //btoc commission schema
  public upsertBtoCCommissionSchema = Joi.object({
    commission_set_id: Joi.number().required(),
  });
}
