import Joi from 'joi';

export default class AdminAPIAirlinesCommissionValidator {
  public updateAPIAirlinesCommissionSchema = Joi.object({
    api_status: Joi.boolean(),
    add: Joi.array()
      .items(
        Joi.object({
          airlines: Joi.array()
            .min(1)
            .items(Joi.string().length(2).required())
            .required(),
          com_domestic: Joi.number().required(),
          com_from_dac: Joi.number().required(),
          com_to_dac: Joi.number().required(),
          com_soto: Joi.number().required(),
          com_type: Joi.string().valid('PER', 'FLAT').required(),
          com_mode: Joi.string().valid('INCREASE', 'DECREASE').required(),
        })
      )
      .min(1)
      .optional(),
    update: Joi.array()
      .items(
        Joi.object({
          id: Joi.number().required(),
          airline: Joi.string().length(2),
          com_domestic: Joi.number(),
          com_from_dac: Joi.number(),
          com_to_dac: Joi.number(),
          com_soto: Joi.number(),
          status: Joi.boolean(),
          com_type: Joi.string().valid('PER', 'FLAT'),
          com_mode: Joi.string().valid('INCREASE', 'DECREASE'),
        })
      )
      .min(1)
      .optional(),
    remove: Joi.array().items(Joi.number()).min(1).optional(),
  });

  public getRoutesCommissionSchema = Joi.object({
    airline: Joi.string().length(2),
    api_id: Joi.number(),
    status: Joi.boolean(),
    api_status: Joi.boolean(),
    limit: Joi.number(),
    skip: Joi.number(),
  });
}
