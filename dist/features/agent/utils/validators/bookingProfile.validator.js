"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class BookingProfileValidator {
    constructor() {
        this.editProfile = joi_1.default.object({
            name: joi_1.default.string().max(255),
            agency_name: joi_1.default.string().max(255),
            agency_phone: joi_1.default.string().max(20),
            agency_email: joi_1.default.string().max(255),
            agency_address: joi_1.default.string().max(255),
            mobile_number: joi_1.default.string().max(20),
            twoFA: joi_1.default.number().valid(0, 1),
        });
    }
}
exports.default = BookingProfileValidator;
