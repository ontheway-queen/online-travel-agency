"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminB2bRegistrationRequestValidator {
    constructor() {
        this.updateRegistrationRequestValidator = joi_1.default.object({
            state: joi_1.default.string().valid("pending", "approved", "rejected").optional(),
            status: joi_1.default.string().optional(),
            rejected_reason: joi_1.default.string().optional(),
            commission_set_id: joi_1.default.when("state", {
                is: "approved",
                then: joi_1.default.number().required(),
                otherwise: joi_1.default.number().optional(),
            }),
            kam_email: joi_1.default.alternatives()
                .conditional('state', {
                is: 'approved',
                then: joi_1.default.string().email().trim().lowercase().required(),
                otherwise: joi_1.default.number().optional(),
            })
        });
        this.registrationRequestQueryValidator = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            key: joi_1.default.string().optional(),
            state: joi_1.default.string().valid("pending", "approved", "rejected").optional(),
            status: joi_1.default.string().optional(),
        });
    }
}
exports.default = AdminB2bRegistrationRequestValidator;
