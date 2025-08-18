"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualBankTransferValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class ManualBankTransferValidator {
    constructor() {
        // create manual bank transfer
        this.createManualBankTransferSchema = joi_1.default.object({
            invoice_id: joi_1.default.string().required(),
            amount: joi_1.default.string().required(),
            bank_name: joi_1.default.string().required(),
            account_number: joi_1.default.string().optional(),
            account_name: joi_1.default.string().optional(),
            transfer_date: joi_1.default.string().optional(),
        });
        // get manual bank transfer
        this.getManualBankTransferSchema = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            start_date: joi_1.default.date().optional(),
            end_date: joi_1.default.date().optional(),
            status: joi_1.default.string().optional(),
            amount: joi_1.default.number().optional(),
        });
        // update manual bank transfer
        this.updateManualBankTransferSchema = joi_1.default.object({
            amount: joi_1.default.number().optional(),
            bank_name: joi_1.default.string().optional(),
            account_number: joi_1.default.string().optional(),
            account_name: joi_1.default.string().optional(),
            transfer_date: joi_1.default.date().optional(),
        });
    }
}
exports.ManualBankTransferValidator = ManualBankTransferValidator;
