"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class TourPackageRequestBToCValidator {
    constructor() {
        this.createTourPackageRequest = joi_1.default.object({
            tour_package_id: joi_1.default.number().integer().positive().required(),
            request_city_id: joi_1.default.number().integer().required(),
            request_date: joi_1.default.date().iso().required(),
            user_first_name: joi_1.default.string().required(),
            user_last_name: joi_1.default.string().required(),
            user_email: joi_1.default.string().email().required().lowercase().trim(),
            user_phone: joi_1.default.string().required(),
            requirements: joi_1.default.string().required(),
        });
        this.updateTourPackageRequest = joi_1.default.object({
            request_city_id: joi_1.default.number().integer().optional(),
            request_date: joi_1.default.date().iso().optional(),
            user_first_name: joi_1.default.string().optional(),
            user_last_name: joi_1.default.string().optional(),
            user_email: joi_1.default.string().email().optional().lowercase().trim(),
            user_phone: joi_1.default.string().optional(),
            requirements: joi_1.default.string().optional(),
            status: joi_1.default.string().valid("PENDING", "APPROVED"),
        });
        // get tour package requests
        this.getTourPackageRequest = joi_1.default.object({
            tour_package_id: joi_1.default.number().optional(),
            request_city_id: joi_1.default.number().optional(),
            requirements: joi_1.default.string().optional(),
            limit: joi_1.default.number().optional(),
            skip: joi_1.default.number().optional(),
            start_date: joi_1.default.date().optional(),
            end_date: joi_1.default.date().optional(),
            key: joi_1.default.string().optional(),
        });
    }
}
exports.default = TourPackageRequestBToCValidator;
