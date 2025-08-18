import Joi from "joi";

export class AdminPartialPaymentRuleValidator {

    public create = Joi.object({
        flight_api_id: Joi.number().required(),
        airline: Joi.string().max(4).optional(),
        from_dac: Joi.boolean().required(),
        to_dac: Joi.boolean().required(),
        one_way: Joi.boolean().optional(),
        round_trip: Joi.boolean().optional(),
        domestic: Joi.boolean().optional(),
        soto: Joi.boolean().optional(),
        travel_date_from_now: Joi.number().required(),
        payment_before: Joi.number().required(),
        payment_percentage: Joi.number().min(0).max(100).optional(),
        note: Joi.string().optional()
    });

    public update = Joi.object({
        airline: Joi.string().max(4).allow(null),
        from_dac: Joi.boolean(),
        to_dac: Joi.boolean(),
        one_way: Joi.boolean(),
        round_trip: Joi.boolean(),
        domestic: Joi.boolean().optional(),
        soto: Joi.boolean().optional(),
        travel_date_from_now: Joi.number(),
        payment_percentage: Joi.number().min(0).max(100),
        payment_before: Joi.number().optional(),
        status: Joi.boolean(),
        note: Joi.string().optional()
    });

    public get = Joi.object({
        flight_api_id: Joi.number().required(),
        airline: Joi.string().max(4),
        from_dac: Joi.boolean(),
        to_dac: Joi.boolean(),
        one_way: Joi.boolean(),
        round_trip: Joi.boolean(),
        status: Joi.boolean(),
        limit: Joi.number(),
        skip: Joi.number()
    });
}
