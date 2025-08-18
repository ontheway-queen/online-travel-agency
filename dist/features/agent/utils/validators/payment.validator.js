"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentPaymentValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AgentPaymentValidator {
    constructor() {
        this.clearLoan = joi_1.default.object({
            amount: joi_1.default.number().required().min(1),
        });
        this.createLoanRequest = joi_1.default.object({
            amount: joi_1.default.number().min(1).required(),
            details: joi_1.default.string(),
        });
        this.topupSchema = joi_1.default.object({
            amount: joi_1.default.number().required().min(10),
        });
    }
}
exports.AgentPaymentValidator = AgentPaymentValidator;
