"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class TourPackageBookingValidatorBTOC {
    constructor() {
        this.tourPackageBooking = joi_1.default.object({
            tour_id: joi_1.default.number().integer().positive().required(), // Required positive integer
            traveler_adult: joi_1.default.number().integer().min(0).required(), // Required non-negative integer
            traveler_child: joi_1.default.number().integer().min(0).optional(), // Non-negative integer
            note_from_customer: joi_1.default.string().optional().allow(''), // Optional string
            travel_date: joi_1.default.date().iso().required(), // Required ISO date
            double_room: joi_1.default.number().integer().min(0), // Non-negative integer
            twin_room: joi_1.default.number().integer().min(0), // Non-negative integer
            booking_info: joi_1.default.object({
                first_name: joi_1.default.string().required(),
                email: joi_1.default.string().email().required().lowercase().trim(),
                phone: joi_1.default.string().required(),
                address: joi_1.default.string().optional(),
            }),
        });
        this.tourPackageBookingUpdate = joi_1.default.object({
            tour_id: joi_1.default.number().integer().positive(), // Optional positive integer
            traveler_adult: joi_1.default.number().integer().min(0), // Optional non-negative integer
            traveler_child: joi_1.default.number().integer().min(0), // Optional non-negative integer
            adult_price: joi_1.default.number().positive(), // Optional positive number
            child_price: joi_1.default.number().positive(), // Optional positive number
            discount: joi_1.default.number().min(0), // Optional non-negative number
            discount_type: joi_1.default.string().valid('FLAT', 'PERCENTAGE'), // Optional, only 'FLAT' or 'PERCENTAGE'
            note_from_customer: joi_1.default.string(), // Optional string
            travel_date: joi_1.default.date().iso(), // Optional ISO date
            double_room: joi_1.default.number().integer().min(0), // Optional non-negative integer
            twin_room: joi_1.default.number().integer().min(0), // Optional non-negative integer
            status: joi_1.default.string(), // Optional string
            booking_info: joi_1.default.object({
                first_name: joi_1.default.string(),
                email: joi_1.default.string().email().lowercase().trim(),
                phone: joi_1.default.string(),
                address: joi_1.default.string(),
            }).optional(), // Optional object with optional fields
        });
        this.tourPackageBookingUpdateB2B = joi_1.default.object({
            status: joi_1.default.string().valid('APPROVED', 'CANCELLED').required(),
        });
    }
}
exports.default = TourPackageBookingValidatorBTOC;
