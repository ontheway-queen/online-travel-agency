import Joi from 'joi';

export default class AdminFlightRouteConfigValidator {
  public createRoutesCommissionSchema = Joi.object({
    routes: Joi.array()
      .items(
        Joi.object({
          departure: Joi.string().required().length(3),
          arrival: Joi.string().required().length(3),
          airline: Joi.string().required().length(2),
          commission: Joi.number().required(),
          com_type: Joi.string().required().valid('PER', 'FLAT'),
          com_mode: Joi.string().required().valid('INCREASE', 'DECREASE'),
          one_way: Joi.boolean().required(),
          round_trip: Joi.boolean().required(),
        })
      )
      .min(1),
  });

  public getRoutesCommissionSchema = Joi.object({
    limit: Joi.number(),
    skip: Joi.number(),
    status: Joi.boolean(),
    departure: Joi.string(),
    arrival: Joi.string(),
    one_way: Joi.boolean(),
    round_trip: Joi.boolean(),
  });

  public updateRoutesCommissionSchema = Joi.object({
    departure: Joi.string().length(3),
    arrival: Joi.string().length(3),
    airline: Joi.string().length(2),
    commission: Joi.number(),
    com_type: Joi.string().valid('PER', 'FLAT'),
    com_mode: Joi.string().valid('INCREASE', 'DECREASE'),
    one_way: Joi.boolean(),
    round_trip: Joi.boolean(),
    status: Joi.boolean(),
  });

  public updateDeleteRoutesCommissionParamsSchema = Joi.object({
    commission_set_id: Joi.number().required(),
    id: Joi.number().required(),
  });

  public createRoutesBlockSchema = Joi.object({
    routes: Joi.array()
      .items(
        Joi.object({
          departure: Joi.string().required().length(3),
          arrival: Joi.string().required().length(3),
          airline: Joi.string().required().length(2),
          one_way: Joi.boolean().required(),
          round_trip: Joi.boolean().required(),
          booking_block: Joi.boolean().required(),
          full_block: Joi.boolean().required(),
        })
      )
      .min(1),
  });

  public getRoutesBlockSchema = Joi.object({
    limit: Joi.number(),
    skip: Joi.number(),
    status: Joi.boolean(),
    departure: Joi.string(),
    airline: Joi.string(),
    arrival: Joi.string(),
    one_way: Joi.boolean(),
    round_trip: Joi.boolean(),
    booking_block: Joi.boolean(),
    full_block: Joi.boolean(),
  });

  public updateRoutesBlockSchema = Joi.object({
    departure: Joi.string().length(3),
    arrival: Joi.string().length(3),
    airline: Joi.string().length(2),
    one_way: Joi.boolean(),
    round_trip: Joi.boolean(),
    booking_block: Joi.boolean(),
    full_block: Joi.boolean(),
    status: Joi.boolean(),
  });
}
