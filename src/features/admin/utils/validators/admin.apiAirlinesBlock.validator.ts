import Joi from 'joi';

export default class AdminAPIAirlinesBlockValidator {

    //create
    public create = Joi.object({
        set_flight_api_id: Joi.number().required(),
        airline: Joi.array().min(1).required(),
        issue_block: Joi.boolean().required(),
        booking_block: Joi.boolean().optional(),
    });

    //update
    public update = Joi.object({
        airline: Joi.string().max(4).optional(),
        issue_block: Joi.boolean().optional(),
        booking_block: Joi.boolean().optional(),
        status: Joi.boolean().optional()
    });
}
