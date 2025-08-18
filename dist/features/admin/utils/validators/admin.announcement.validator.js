"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAnnouncementValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminAnnouncementValidator {
    constructor() {
        this.createAnnouncementSchema = joi_1.default.object({
            message: joi_1.default.string().required(),
            start_date: joi_1.default.date().required(),
            end_date: joi_1.default.date().optional(),
            link: joi_1.default.string().optional().allow(""),
            is_active: joi_1.default.boolean().optional(),
            type: joi_1.default.string().valid("B2B", "B2C").required(),
        });
        this.updateAnnouncementSchema = joi_1.default.object({
            message: joi_1.default.string().optional(),
            start_date: joi_1.default.date().optional(),
            end_date: joi_1.default.date().optional(),
            link: joi_1.default.string().optional().allow("").allow(null),
            is_active: joi_1.default.boolean().optional(),
            type: joi_1.default.string().valid("B2B", "B2C").optional(),
        });
    }
}
exports.AdminAnnouncementValidator = AdminAnnouncementValidator;
