"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.B2BReissueRequestValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class B2BReissueRequestValidator {
    constructor() {
        this.CreateReissueRequestSchema = joi_1.default.object({
            booking_id: joi_1.default.number().required(),
            reason: joi_1.default.string().optional(),
            traveler_id: joi_1.default.array().items(joi_1.default.number()).min(1).required()
        });
    }
}
exports.B2BReissueRequestValidator = B2BReissueRequestValidator;
