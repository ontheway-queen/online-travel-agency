"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminB2BReissueRequestValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class AdminB2BReissueRequestValidator {
    constructor() {
        this.UpdateReissueRequest = joi_1.default.object({
            staff_id: joi_1.default.number().optional(),
            status: joi_1.default.string().valid(constants_1.REISSUE_STATUS_PROCESSING, constants_1.REISSUE_STATUS_REJECTED).optional(),
            reissue_amount: joi_1.default.number()
                .min(1)
                .when('status', {
                is: constants_1.REISSUE_STATUS_PROCESSING,
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            })
        });
    }
}
exports.AdminB2BReissueRequestValidator = AdminB2BReissueRequestValidator;
