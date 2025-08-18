"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class SpecialOfferValidator {
    constructor() {
        this.createSpecialOffer = joi_1.default.object({
            title: joi_1.default.string().min(1).max(255).required(),
            type: joi_1.default.string().max(255).optional(),
            description: joi_1.default.string().optional(),
            panel: joi_1.default.string().valid("B2B", "B2C", "ALL").required()
        });
        this.updateSpecialOffer = joi_1.default.object({
            title: joi_1.default.string().min(1).max(255).optional(),
            type: joi_1.default.string().max(255).optional(),
            description: joi_1.default.string().optional(),
            status: joi_1.default.string()
                .valid("ACTIVE", "INACTIVE")
                .messages({
                "any.only": "Status must be either ACTIVE or INACTIVE",
            })
                .optional(),
            panel: joi_1.default.string().valid("B2B", "B2C", "ALL").optional()
        });
        this.getSpecialOfferQuery = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            key: joi_1.default.string().optional(),
            type: joi_1.default.string().optional(),
            status: joi_1.default.string().optional(),
            panel: joi_1.default.string().optional()
        });
    }
}
exports.default = SpecialOfferValidator;
