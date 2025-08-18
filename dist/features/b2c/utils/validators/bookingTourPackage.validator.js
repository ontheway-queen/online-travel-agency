"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingTourPackageValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class BookingTourPackageValidator {
    constructor() {
        this.fixedPackageBookingBodySchema = joi_1.default.object({
            traveler_adult: joi_1.default.number(),
            traveler_child: joi_1.default.number().optional(),
            note_from_customer: joi_1.default.string().optional().allow(''),
            travel_date: joi_1.default.date(),
            double_room: joi_1.default.number().optional().allow(''),
            twin_room: joi_1.default.number().optional().allow(''),
        });
        this.PackageBookingParamSchema = joi_1.default.object({
            tour_id: joi_1.default.number().required(),
        });
        this.customizePackageBookingBodySchema = joi_1.default.object({
            full_name: joi_1.default.string().required(),
            email: joi_1.default.string().email().lowercase().trim(),
            phone: joi_1.default.number().required(),
            address: joi_1.default.string(),
            note: joi_1.default.string(),
        });
    }
}
exports.BookingTourPackageValidator = BookingTourPackageValidator;
