import Joi from 'joi';

export class AdminAirlinesPreferenceValidator {
  public createAirlinePref = Joi.object({
    body: Joi.array()
      .items(
        Joi.object({
          airlines_code: Joi.string().required().label('Airline code'),
          dynamic_fare_supplier_id: Joi.number()
            .integer()
            .required()
            .label('Supplier ID'),
          preference_type: Joi.string()
            .valid('PREFERRED', 'BLOCKED')
            .required()
            .label('Preference type'),
          from_dac: Joi.boolean().required(),
          to_dac: Joi.boolean().required(),
          domestic: Joi.boolean().required(),
          soto: Joi.boolean().required(),
        })
      )
      .min(1)
      .required()
      .label('Airline Preferences Array'),
  });

  public getAirlinePref = Joi.object({
    dynamic_fare_supplier_id: Joi.number().required(),
    pref_type: Joi.string().valid('PREFERRED', 'BLOCKED').optional(),
    status: Joi.boolean().optional(),
    filter: Joi.string().optional(),
  });

  public updateAirlinePref = Joi.object({
    preference_type: Joi.string().valid('PREFERRED', 'BLOCKED').optional(),
    status: Joi.boolean().optional(),
    from_dac: Joi.boolean().optional(),
    to_dac: Joi.boolean().optional(),
    domestic: Joi.boolean().optional(),
    soto: Joi.boolean().optional(),
  });
}
