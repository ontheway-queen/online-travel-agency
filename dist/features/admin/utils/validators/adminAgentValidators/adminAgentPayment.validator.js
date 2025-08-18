"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAgentPaymentValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminAgentPaymentValidator {
    constructor() {
        this.giveAgencyLoanValidator = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            amount: joi_1.default.number().required(),
            details: joi_1.default.string().optional().allow(""),
            date: joi_1.default.date().required(),
        });
        this.adjustAgencyLoanValidator = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            amount: joi_1.default.number().required(),
            details: joi_1.default.string().optional().allow(""),
            date: joi_1.default.date().optional(),
        });
        this.getLoanRequestQuery = joi_1.default.object({
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            status: joi_1.default.string().valid("Pending", "Approved", "Rejected"),
            agency_id: joi_1.default.number(),
            from_date: joi_1.default.date(),
            to_date: joi_1.default.date(),
        });
        this.updateLoanReq = joi_1.default.object({
            status: joi_1.default.string().valid("Approved", "Rejected").required(),
            note: joi_1.default.string().optional(),
        });
    }
}
exports.AdminAgentPaymentValidator = AdminAgentPaymentValidator;
