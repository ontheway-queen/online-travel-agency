"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAgentAgencyValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminAgentAgencyValidator {
    constructor() {
        // create agency schema
        this.createAgencySchema = joi_1.default.object({
            agency_email: joi_1.default.string().email().lowercase().trim().required(),
            agency_phone: joi_1.default.string().required(),
            agency_name: joi_1.default.string().required(),
            user_name: joi_1.default.string().required(),
            user_email: joi_1.default.string().email().lowercase().trim().required(),
            user_password: joi_1.default.string().required(),
            user_phone: joi_1.default.string().required(),
            commission_set_id: joi_1.default.number().required(),
            address: joi_1.default.string().required(),
            kam_email: joi_1.default.string().email().trim().lowercase().optional(),
        });
        // update agency schema
        this.updateAgencySchema = joi_1.default.object({
            email: joi_1.default.string().email().lowercase().trim().optional(),
            phone: joi_1.default.string().optional(),
            agency_name: joi_1.default.string().optional(),
            commission: joi_1.default.number().min(0).optional(),
            status: joi_1.default.number().valid('true', 'false').optional(),
            commission_set_id: joi_1.default.number().optional(),
            address: joi_1.default.string().optional(),
            kam_email: joi_1.default.string().email().trim().lowercase().optional(),
        });
        // create agency user schema
        this.createAgencyUserSchema = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            name: joi_1.default.string().required(),
            email: joi_1.default.string().email().lowercase().trim().required(),
            password: joi_1.default.string().required(),
            mobile_number: joi_1.default.string().min(11).max(14).required(),
        });
        // update agency user schema
        this.updateAgencyUserSchema = joi_1.default.object({
            name: joi_1.default.string().optional(),
            email: joi_1.default.string().email().lowercase().trim().optional(),
            mobile_number: joi_1.default.string().min(11).max(14).optional(),
            status: joi_1.default.number().valid(0, 1).optional(),
        });
        //deposit to agency schema
        this.depositToAgencySchema = joi_1.default.object({
            agency_id: joi_1.default.number().required(),
            type: joi_1.default.string().valid('credit', 'debit').required(),
            amount: joi_1.default.number().required(),
            details: joi_1.default.string().optional(),
        });
        this.updateDepositRequestBodySchema = joi_1.default.object({
            status: joi_1.default.string().valid('approved', 'declined').required(),
            reason: joi_1.default.string().max(255).optional().allow(null, ''),
            remarks: joi_1.default.string().max(255).optional().allow(null, ''),
        });
    }
}
exports.AdminAgentAgencyValidator = AdminAgentAgencyValidator;
