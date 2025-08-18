import Joi from "joi";
import { REFUND_STATUS_PROCESSING, REFUND_STATUS_REJECTED } from "../../../../utils/miscellaneous/constants";

export class AdminB2BRefundRequestValidator {

    public UpdateRefundRequest = Joi.object({
        staff_id: Joi.number().optional(),
        status: Joi.string().valid(REFUND_STATUS_PROCESSING, REFUND_STATUS_REJECTED).optional(),
        refund_amount: Joi.number()
            .min(1)
            .when('status', {
                is: REFUND_STATUS_PROCESSING,
                then: Joi.required(),
                otherwise: Joi.optional()
            })
    })
}