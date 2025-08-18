"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingUmrahPackageValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class BookingUmrahPackageValidator {
    constructor() {
        this.umrahPackageBookingBodySchema = joi_1.default.object({
            umrah_id: joi_1.default.number().required(),
            traveler_adult: joi_1.default.number(),
            traveler_child: joi_1.default.number().optional(),
            note_from_customer: joi_1.default.string().optional(),
            travel_date: joi_1.default.date(),
            double_room: joi_1.default.number().optional().allow(''),
            twin_room: joi_1.default.number().optional().allow(''),
            booking_info: joi_1.default.object({
                first_name: joi_1.default.string(),
                email: joi_1.default.string().email().trim().lowercase(),
                phone: joi_1.default.string(),
                address: joi_1.default.string(),
            }).optional(),
        });
        this.PackageBookingParamSchema = joi_1.default.object({
            umrah_id: joi_1.default.number().required(),
        });
        this.customizePackageBookingBodySchema = joi_1.default.object({
            full_name: joi_1.default.string().required(),
            email: joi_1.default.string().email().allow('').lowercase().trim(),
            phone: joi_1.default.number().required(),
            address: joi_1.default.string().allow(''),
            note: joi_1.default.string().allow(''),
        });
    }
}
exports.BookingUmrahPackageValidator = BookingUmrahPackageValidator;
