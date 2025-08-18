"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPartialPaymentRuleValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminPartialPaymentRuleValidator {
    constructor() {
        this.create = joi_1.default.object({
            flight_api_id: joi_1.default.number().required(),
            airline: joi_1.default.string().max(4).optional(),
            from_dac: joi_1.default.boolean().required(),
            to_dac: joi_1.default.boolean().required(),
            one_way: joi_1.default.boolean().optional(),
            round_trip: joi_1.default.boolean().optional(),
            domestic: joi_1.default.boolean().optional(),
            soto: joi_1.default.boolean().optional(),
            travel_date_from_now: joi_1.default.number().required(),
            payment_before: joi_1.default.number().required(),
            payment_percentage: joi_1.default.number().min(0).max(100).optional(),
            note: joi_1.default.string().optional()
        });
        this.update = joi_1.default.object({
            airline: joi_1.default.string().max(4).allow(null),
            from_dac: joi_1.default.boolean(),
            to_dac: joi_1.default.boolean(),
            one_way: joi_1.default.boolean(),
            round_trip: joi_1.default.boolean(),
            domestic: joi_1.default.boolean().optional(),
            soto: joi_1.default.boolean().optional(),
            travel_date_from_now: joi_1.default.number(),
            payment_percentage: joi_1.default.number().min(0).max(100),
            payment_before: joi_1.default.number().optional(),
            status: joi_1.default.boolean(),
            note: joi_1.default.string().optional()
        });
        this.get = joi_1.default.object({
            flight_api_id: joi_1.default.number().required(),
            airline: joi_1.default.string().max(4),
            from_dac: joi_1.default.boolean(),
            to_dac: joi_1.default.boolean(),
            one_way: joi_1.default.boolean(),
            round_trip: joi_1.default.boolean(),
            status: joi_1.default.boolean(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number()
        });
    }
}
exports.AdminPartialPaymentRuleValidator = AdminPartialPaymentRuleValidator;
