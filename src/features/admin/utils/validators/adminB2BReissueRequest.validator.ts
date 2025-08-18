import Joi from "joi";
import { REISSUE_STATUS_PROCESSING, REISSUE_STATUS_REJECTED } from "../../../../utils/miscellaneous/constants";

export class AdminB2BReissueRequestValidator {

    public UpdateReissueRequest = Joi.object({
        staff_id: Joi.number().optional(),
        status: Joi.string().valid(REISSUE_STATUS_PROCESSING, REISSUE_STATUS_REJECTED).optional(),
        reissue_amount: Joi.number()
            .min(1)
            .when('status', {
                is: REISSUE_STATUS_PROCESSING,
                then: Joi.required(),
                otherwise: Joi.optional()
            })
    })
}