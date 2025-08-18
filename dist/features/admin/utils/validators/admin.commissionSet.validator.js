"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminCommissionSetValidator {
    constructor() {
        // create Commission set
        this.createCommissionSetSchema = joi_1.default.object({
            name: joi_1.default.string().required(),
            api: joi_1.default.array()
                .items(joi_1.default.object({
                api_id: joi_1.default.number().required(),
                airlines: joi_1.default.array()
                    .min(1)
                    .items(joi_1.default.string().length(2).required())
                    .required(),
                com_domestic: joi_1.default.number().required(),
                com_from_dac: joi_1.default.number().required(),
                com_to_dac: joi_1.default.number().required(),
                com_soto: joi_1.default.number().required(),
                com_type: joi_1.default.string().valid("PER", "FLAT").required(),
                com_mode: joi_1.default.string().valid("INCREASE", "DECREASE").required(),
                booking_block: joi_1.default.boolean().optional(),
                issue_block: joi_1.default.boolean().optional(),
            }))
                .min(1)
                .optional(),
        });
        // Get Commission set schema
        this.getCommissionSetSchema = joi_1.default.object({
            name: joi_1.default.string().optional(),
            status: joi_1.default.boolean().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
        });
        // Update commission set schema
        this.updateCommissionSetSchema = joi_1.default.object({
            name: joi_1.default.string().optional(),
            add: joi_1.default.array().items(joi_1.default.number().required()).optional(),
            update: joi_1.default.array().items(joi_1.default.object({
                id: joi_1.default.number().required(),
                status: joi_1.default.boolean().required(),
                booking_block: joi_1.default.boolean().optional(),
                issue_block: joi_1.default.boolean().optional(),
            })),
        });
        //btoc commission schema
        this.upsertBtoCCommissionSchema = joi_1.default.object({
            commission_set_id: joi_1.default.number().required(),
        });
    }
}
exports.default = AdminCommissionSetValidator;
