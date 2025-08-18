"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminReportValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminReportValidator {
    constructor() {
        this.B2CPaymentTransactionReportQueryValidator = joi_1.default.object({
            start_date: joi_1.default.string().isoDate().label('Start Date').optional().messages({
                'string.base': `"Start Date" must be a string`,
                'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
                'any.required': `"Start Date" is required`,
            }),
            end_date: joi_1.default.string().isoDate().label('End Date').optional().messages({
                'string.base': `"End Date" must be a string`,
                'string.isoDate': `"End Date" must be a valid ISO date`,
                'any.required': `"End Date" is required`,
            }),
            filter: joi_1.default.string().optional().label('Filter').messages({
                'string.base': `"Filter" must be a string`,
            }),
            limit: joi_1.default.number().integer().min(1).max(1000).optional().label('Limit').messages({
                'number.base': `"Limit" must be a number`,
                'number.min': `"Limit" must be at least 1`,
                'number.max': `"Limit" must not exceed 1000`,
            }),
            skip: joi_1.default.number().integer().min(0).optional().label('Skip').messages({
                'number.base': `"Skip" must be a number`,
                'number.min': `"Skip" cannot be negative`,
            }),
        });
        this.B2BTopUpReportQueryValidator = joi_1.default.object({
            start_date: joi_1.default.string().isoDate().label('Start Date').optional().messages({
                'string.base': `"Start Date" must be a string`,
                'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
                'any.required': `"Start Date" is required`,
            }),
            end_date: joi_1.default.string().isoDate().label('End Date').optional().messages({
                'string.base': `"End Date" must be a string`,
                'string.isoDate': `"End Date" must be a valid ISO date`,
                'any.required': `"End Date" is required`,
            }),
            agency_id: joi_1.default.string().trim().optional().label('Agency ID').messages({
                'string.base': `"Agency ID" must be a string`,
            }),
            limit: joi_1.default.number().integer().min(1).max(1000).optional().label('Limit').messages({
                'number.base': `"Limit" must be a number`,
                'number.min': `"Limit" must be at least 1`,
                'number.max': `"Limit" must not exceed 1000`,
            }),
            skip: joi_1.default.number().integer().min(0).optional().label('Skip').messages({
                'number.base': `"Skip" must be a number`,
                'number.min': `"Skip" cannot be negative`,
            }),
        });
        this.B2BLedgerReportQueryValidator = joi_1.default.object({
            agency_id: joi_1.default.string().trim().required().label('Agency ID').messages({
                'string.base': `"Agency ID" must be a string`,
            }),
            start_date: joi_1.default.string().isoDate().label('Start Date').optional().messages({
                'string.base': `"Start Date" must be a string`,
                'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
                'any.required': `"Start Date" is required`,
            }),
            end_date: joi_1.default.string().isoDate().label('End Date').optional().messages({
                'string.base': `"End Date" must be a string`,
                'string.isoDate': `"End Date" must be a valid ISO date`,
                'any.required': `"End Date" is required`,
            }),
            limit: joi_1.default.number().integer().min(1).max(1000).optional().label('Limit').messages({
                'number.base': `"Limit" must be a number`,
                'number.min': `"Limit" must be at least 1`,
                'number.max': `"Limit" must not exceed 1000`,
            }),
            skip: joi_1.default.number().integer().min(0).optional().label('Skip').messages({
                'number.base': `"Skip" must be a number`,
                'number.min': `"Skip" cannot be negative`,
            }),
        });
        this.B2BSalesReportQueryValidator = joi_1.default.object({
            start_date: joi_1.default.string().isoDate().label('Start Date').optional().messages({
                'string.base': `"Start Date" must be a string`,
                'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
                'any.required': `"Start Date" is required`,
            }),
            end_date: joi_1.default.string().isoDate().label('End Date').optional().messages({
                'string.base': `"End Date" must be a string`,
                'string.isoDate': `"End Date" must be a valid ISO date`,
                'any.required': `"End Date" is required`,
            }),
            limit: joi_1.default.number().integer().min(1).max(1000).optional().label('Limit').messages({
                'number.base': `"Limit" must be a number`,
                'number.min': `"Limit" must be at least 1`,
                'number.max': `"Limit" must not exceed 1000`,
            }),
            skip: joi_1.default.number().integer().min(0).optional().label('Skip').messages({
                'number.base': `"Skip" must be a number`,
                'number.min': `"Skip" cannot be negative`,
            }),
            agency_id: joi_1.default.string().trim().optional().label('Agency ID').messages({
                'string.base': `"Agency ID" must be a string`,
            }),
            status: joi_1.default.string().trim().optional().label('Status').messages({
                'string.base': `"Status" must be a string`,
            }),
        });
        this.B2BTicketWiseReportQueryValidator = joi_1.default.object({
            start_date: joi_1.default.string().isoDate().label('Start Date').optional().messages({
                'string.base': `"Start Date" must be a string`,
                'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
                'any.required': `"Start Date" is required`,
            }),
            end_date: joi_1.default.string().isoDate().label('End Date').optional().messages({
                'string.base': `"End Date" must be a string`,
                'string.isoDate': `"End Date" must be a valid ISO date`,
                'any.required': `"End Date" is required`,
            }),
            limit: joi_1.default.number().integer().min(1).max(1000).optional().label('Limit').messages({
                'number.base': `"Limit" must be a number`,
                'number.min': `"Limit" must be at least 1`,
                'number.max': `"Limit" must not exceed 1000`,
            }),
            skip: joi_1.default.number().integer().min(0).optional().label('Skip').messages({
                'number.base': `"Skip" must be a number`,
                'number.min': `"Skip" cannot be negative`,
            }),
            agency_id: joi_1.default.string().trim().optional().label('Agency ID').messages({
                'string.base': `"Agency ID" must be a string`,
            }),
            filter: joi_1.default.string().trim().optional().label('Filter').messages({
                'string.base': `"Filter" must be a string`,
            }),
        });
        this.B2BFlightBookingReportQueryValidator = joi_1.default.object({
            start_date: joi_1.default.string().isoDate().label('Start Date').optional().messages({
                'string.base': `"Start Date" must be a string`,
                'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
                'any.required': `"Start Date" is required`,
            }),
            end_date: joi_1.default.string().isoDate().label('End Date').optional().messages({
                'string.base': `"End Date" must be a string`,
                'string.isoDate': `"End Date" must be a valid ISO date`,
                'any.required': `"End Date" is required`,
            }),
            limit: joi_1.default.number().integer().min(1).max(1000).optional().label('Limit').messages({
                'number.base': `"Limit" must be a number`,
                'number.min': `"Limit" must be at least 1`,
                'number.max': `"Limit" must not exceed 1000`,
            }),
            skip: joi_1.default.number().integer().min(0).optional().label('Skip').messages({
                'number.base': `"Skip" must be a number`,
                'number.min': `"Skip" cannot be negative`,
            }),
            agency_id: joi_1.default.string().trim().optional().label('Agency ID').messages({
                'string.base': `"Agency ID" must be a string`,
            }),
            filter: joi_1.default.string().trim().optional().label('Filter').messages({
                'string.base': `"Filter" must be a string`,
            }),
            status: joi_1.default.string().trim().optional().label('Status').messages({
                'string.base': `"Status" must be a string`,
            }),
        });
        this.B2CFlightBookingReportQueryValidator = joi_1.default.object({
            start_date: joi_1.default.string().isoDate().label('Start Date').optional().messages({
                'string.base': `"Start Date" must be a string`,
                'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
                'any.required': `"Start Date" is required`,
            }),
            end_date: joi_1.default.string().isoDate().label('End Date').optional().messages({
                'string.base': `"End Date" must be a string`,
                'string.isoDate': `"End Date" must be a valid ISO date`,
                'any.required': `"End Date" is required`,
            }),
            limit: joi_1.default.number().integer().min(1).max(1000).optional().label('Limit').messages({
                'number.base': `"Limit" must be a number`,
                'number.min': `"Limit" must be at least 1`,
                'number.max': `"Limit" must not exceed 1000`,
            }),
            skip: joi_1.default.number().integer().min(0).optional().label('Skip').messages({
                'number.base': `"Skip" must be a number`,
                'number.min': `"Skip" cannot be negative`,
            }),
            user_id: joi_1.default.string().trim().optional().label('User ID').messages({
                'string.base': `"User ID" must be a string`,
            }),
            filter: joi_1.default.string().trim().optional().label('Filter').messages({
                'string.base': `"Filter" must be a string`,
            }),
            status: joi_1.default.string().trim().optional().label('Status').messages({
                'string.base': `"Status" must be a string`,
            }),
        });
    }
}
exports.AdminReportValidator = AdminReportValidator;
