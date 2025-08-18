"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCurrencyValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminCurrencyValidator {
    constructor() {
        this.createApiWiseCurrency = joi_1.default.object({
            api_id: joi_1.default.number().required(),
            api_currency: joi_1.default.string().required(),
            currency_value: joi_1.default.number().required(),
            type: joi_1.default.string().valid('FLIGHT', 'HOTEL').required()
        });
        this.updateApiWiseCurrency = joi_1.default.object({
            currency_value: joi_1.default.number()
        });
        this.getApiListFilter = joi_1.default.object({
            type: joi_1.default.string().valid('FLIGHT', 'HOTEL').required()
        });
    }
}
exports.AdminCurrencyValidator = AdminCurrencyValidator;
