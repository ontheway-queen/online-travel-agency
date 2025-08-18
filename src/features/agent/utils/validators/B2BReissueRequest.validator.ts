import Joi from "joi";

export class B2BReissueRequestValidator{

    public CreateReissueRequestSchema = Joi.object({
        booking_id: Joi.number().required(),
        reason: Joi.string().optional(),
        traveler_id: Joi.array().items(Joi.number()).min(1).required()
    })
}