"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
// flight booking validator schema
class FlightBookingValidator {
    constructor() {
        // get all flight booking validator
        this.getAllFlightBookingSchema = joi_1.default.object({
            status: joi_1.default.string().allow("").optional(),
            pnr: joi_1.default.string().allow("").optional(),
            limit: joi_1.default.string().allow("").optional(),
            skip: joi_1.default.string().allow("").optional(),
            from_date: joi_1.default.string().allow("").optional(),
            to_date: joi_1.default.string().allow("").optional(),
        });
        // pnr create schema start //
        this.passengerSchema = joi_1.default.object({
            type: joi_1.default.string()
                .valid("Adult", "Child", "Infant")
                .required()
                .messages({
                "any.required": "Provide valid passenger type",
                "any.only": "Invalid passenger type",
            }),
            title: joi_1.default.string()
                .valid("Ms", "Mr", "Mrs", "Mstr", "Miss")
                .required()
                .messages({
                "any.required": "Provide valid passenger title",
            }),
            first_name: joi_1.default.string().required().messages({
                "any.required": "Provide valid f name",
            }),
            last_name: joi_1.default.string().required().messages({
                "any.required": "Provide valid l name",
            }),
            contact_number: joi_1.default.string().required().messages({
                "any.required": "Provide valid phone",
            }),
            date_of_birth: joi_1.default.string().required().messages({
                "any.required": "Provide valid date of birth",
            }),
            gender: joi_1.default.string()
                .required()
                .messages({
                "any.required": "Provide valid gender",
                "any.only": "Invalid gender",
            }),
            email: joi_1.default.string().email().required().lowercase().trim().messages({
                "any.required": "Provide valid email",
                "string.email": "Invalid email format",
            }),
            address: joi_1.default.string().allow('').required().messages({
                'string.empty': 'Address must be a string',
            }),
            country_code: joi_1.default.string().required(),
            nationality: joi_1.default.string().required(),
            passport_number: joi_1.default.string().optional(),
            passport_expiry_date: joi_1.default.string().optional(),
            passport_nationality: joi_1.default.string().optional(),
            is_lead_passenger: joi_1.default.boolean().required()
            // save_information: Joi.boolean().optional(),
        });
        this.pnrCreateSchema = joi_1.default.object({
            flight_id: joi_1.default.string().required().messages({
                "any.required": "Provide valid flight id",
            }),
            passengers: joi_1.default.array().items(this.passengerSchema.required()).required(),
        });
        // TICKET ISSUE SCHEMA
        this.ticketIssueSchema = joi_1.default.object({
            booking_id: joi_1.default.number().required().messages({
                "any.required": "Provide valid booking id",
            }),
        });
        this.btocBookingRequestValidator = joi_1.default.object({
            status: joi_1.default.string().valid("cancelled").required(),
        });
    }
}
exports.default = FlightBookingValidator;
