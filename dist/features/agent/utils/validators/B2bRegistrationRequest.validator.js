"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class B2bRegistrationRequestValidator {
    constructor() {
        this.registrationRequestValidator = joi_1.default.object({
            name: joi_1.default.string().max(255).required().trim(),
            agency_name: joi_1.default.string().max(255).required().trim(),
            agency_phone: joi_1.default.string().max(255).optional(),
            email: joi_1.default.string().email().max(255).required().email().lowercase().trim(),
            mobile_number: joi_1.default.string().max(255).optional(),
            address: joi_1.default.string().optional(),
            postal_code: joi_1.default.string().max(255),
        });
        this.verifyRegistrationRequestValidator = joi_1.default.object({
            otp: joi_1.default.string().required(),
            email: joi_1.default.string().email().max(255).lowercase().trim().required(),
            payload: joi_1.default.object({
                name: joi_1.default.string().max(255).required(),
                email: joi_1.default.string().email().max(255).lowercase().trim().required(),
                mobile_number: joi_1.default.string().max(255).allow(""),
                address: joi_1.default.string().allow(""),
                postal_code: joi_1.default.string().allow(""),
                agency_name: joi_1.default.string().required(),
                agency_phone: joi_1.default.string().allow(""),
                agency_email: joi_1.default.string().allow("").lowercase().trim(),
                agency_logo: joi_1.default.string().allow(""),
                photo: joi_1.default.string().allow(""),
                trade_license: joi_1.default.string().allow(""),
                visiting_card: joi_1.default.string().allow(""),
            }).required(),
        });
    }
}
exports.default = B2bRegistrationRequestValidator;
