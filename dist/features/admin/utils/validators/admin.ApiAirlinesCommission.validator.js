"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminAPIAirlinesCommissionValidator {
    constructor() {
        this.updateAPIAirlinesCommissionSchema = joi_1.default.object({
            api_status: joi_1.default.boolean(),
            add: joi_1.default.array()
                .items(joi_1.default.object({
                airlines: joi_1.default.array()
                    .min(1)
                    .items(joi_1.default.string().length(2).required())
                    .required(),
                com_domestic: joi_1.default.number().required(),
                com_from_dac: joi_1.default.number().required(),
                com_to_dac: joi_1.default.number().required(),
                com_soto: joi_1.default.number().required(),
                com_type: joi_1.default.string().valid('PER', 'FLAT').required(),
                com_mode: joi_1.default.string().valid('INCREASE', 'DECREASE').required(),
            }))
                .min(1)
                .optional(),
            update: joi_1.default.array()
                .items(joi_1.default.object({
                id: joi_1.default.number().required(),
                airline: joi_1.default.string().length(2),
                com_domestic: joi_1.default.number(),
                com_from_dac: joi_1.default.number(),
                com_to_dac: joi_1.default.number(),
                com_soto: joi_1.default.number(),
                status: joi_1.default.boolean(),
                com_type: joi_1.default.string().valid('PER', 'FLAT'),
                com_mode: joi_1.default.string().valid('INCREASE', 'DECREASE'),
            }))
                .min(1)
                .optional(),
            remove: joi_1.default.array().items(joi_1.default.number()).min(1).optional(),
        });
        this.getRoutesCommissionSchema = joi_1.default.object({
            airline: joi_1.default.string().length(2),
            api_id: joi_1.default.number(),
            status: joi_1.default.boolean(),
            api_status: joi_1.default.boolean(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
    }
}
exports.default = AdminAPIAirlinesCommissionValidator;
