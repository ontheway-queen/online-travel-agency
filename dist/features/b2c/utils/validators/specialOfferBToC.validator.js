"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class SpecialOfferBToCValidator {
    constructor() {
        this.getSpecialOfferQuery = joi_1.default.object({
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            key: joi_1.default.string().optional(),
            type: joi_1.default.string().optional(),
            status: joi_1.default.string().valid("ACTIVE", "INACTIVE"),
        });
    }
}
exports.default = SpecialOfferBToCValidator;
