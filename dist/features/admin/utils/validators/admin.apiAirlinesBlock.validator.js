"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminAPIAirlinesBlockValidator {
    constructor() {
        //create
        this.create = joi_1.default.object({
            set_flight_api_id: joi_1.default.number().required(),
            airline: joi_1.default.array().min(1).required(),
            issue_block: joi_1.default.boolean().required(),
            booking_block: joi_1.default.boolean().optional(),
        });
        //update
        this.update = joi_1.default.object({
            airline: joi_1.default.string().max(4).optional(),
            issue_block: joi_1.default.boolean().optional(),
            booking_block: joi_1.default.boolean().optional(),
            status: joi_1.default.boolean().optional()
        });
    }
}
exports.default = AdminAPIAirlinesBlockValidator;
