"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminB2CFlightValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const flightConstants_1 = require("../../../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
class AdminB2CFlightValidator {
    constructor() {
        this.jsonStringParser = (schema) => joi_1.default.alternatives().try(schema, joi_1.default.string().custom((value, helpers) => {
            try {
                const parsed = JSON.parse(value);
                const { error } = schema.validate(parsed);
                if (error)
                    return helpers.error("any.invalid");
                return parsed;
            }
            catch (_a) {
                return helpers.error("any.invalid");
            }
        }));
        //update booking
        this.updateBooking = joi_1.default.object({
            status: joi_1.default.string().valid(flightConstants_1.FLIGHT_TICKET_ISSUE, flightConstants_1.FLIGHT_BOOKING_CANCELLED, flightConstants_1.FLIGHT_BOOKING_VOID, flightConstants_1.FLIGHT_BOOKING_REFUNDED, flightConstants_1.FLIGHT_BOOKING_CONFIRMED).required(),
            gds_pnr: joi_1.default.string().optional().trim(),
            airline_pnr: joi_1.default.string().trim().when('status', {
                is: flightConstants_1.FLIGHT_BOOKING_CONFIRMED,
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            }),
            ticket_issue_last_time: joi_1.default.string().when('status', {
                is: flightConstants_1.FLIGHT_BOOKING_CONFIRMED,
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            }),
            deduction_amount: joi_1.default.number().min(1).when('status', {
                is: joi_1.default.valid(flightConstants_1.FLIGHT_BOOKING_REFUNDED, flightConstants_1.FLIGHT_BOOKING_VOID),
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            }),
            ticket_numbers: joi_1.default.array()
                .items(joi_1.default.object({
                traveler_id: joi_1.default.number().required(),
                ticket_number: joi_1.default.string().required().trim(),
            })).min(1)
                .when('status', {
                is: flightConstants_1.FLIGHT_TICKET_ISSUE,
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional()
            })
        });
        //update ticket number
        this.updatePendingTicketIssuance = joi_1.default.object({
            status: joi_1.default.string().valid("approved", "rejected"),
            ticket_numbers: joi_1.default.array()
                .items(joi_1.default.object({
                traveler_id: joi_1.default.number().required(),
                ticket_number: joi_1.default.string().required(),
            }))
                .when("status", {
                is: flightConstants_1.PENDING_TICKET_ISSUANCE_STATUS.APPROVED,
                then: joi_1.default.required(),
            }),
        });
        this.updateBlockedBookingValidator = joi_1.default.object({
            pnr_code: joi_1.default.string().optional(),
            airline_pnr: joi_1.default.string().optional(),
            last_time: joi_1.default.string().optional(),
            api_booking_ref: joi_1.default.string().optional(),
            status: joi_1.default.string()
                .valid(flightConstants_1.FLIGHT_BOOKING_IN_PROCESS, flightConstants_1.FLIGHT_BOOKING_CONFIRMED, flightConstants_1.FLIGHT_TICKET_ISSUE, flightConstants_1.FLIGHT_BOOKING_CANCELLED, flightConstants_1.FLIGHT_BOOKING_ON_HOLD)
                .optional(),
            user_id: joi_1.default.number().optional(),
            ticket_numbers: joi_1.default.array()
                .items(joi_1.default.object({
                traveler_id: joi_1.default.number().required(),
                ticket_number: joi_1.default.string().required(),
            }))
                .when("status", {
                is: flightConstants_1.FLIGHT_TICKET_ISSUE,
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional(),
            }),
        });
        //edit booking info
        this.editBookingInfo = joi_1.default.object({
            pnr_code: joi_1.default.string().allow(""),
            last_time: joi_1.default.string().allow(""),
            airline_pnr: joi_1.default.string().allow(""),
            travelers: joi_1.default.array().items({
                id: joi_1.default.number().required(),
                title: joi_1.default.string().valid("Mr", "Mrs", "MSTR", "MS", "Miss"),
                first_name: joi_1.default.string(),
                last_name: joi_1.default.string(),
                date_of_birth: joi_1.default.date(),
                gender: joi_1.default.string().valid("Male", "Female"),
                contact_number: joi_1.default.string(),
                passport_number: joi_1.default.string(),
                ticket_number: joi_1.default.string()
            }),
            segments: joi_1.default.array().items({
                id: joi_1.default.number(),
                class: joi_1.default.string(),
                baggage: joi_1.default.string(),
                departure_date: joi_1.default.date(),
                departure_time: joi_1.default.string(),
                arrival_date: joi_1.default.date(),
                arrival_time: joi_1.default.string()
            })
        });
        // Flight schema
        this.flightSchema = joi_1.default.object({
            airline_code: joi_1.default.string().allow("").allow(null).required(),
            flight_number: joi_1.default.string().required().allow("").allow(null),
            origin: joi_1.default.string().required().allow("").allow(null),
            destination: joi_1.default.string().required().allow("").allow(null),
            class: joi_1.default.string().optional().allow("").allow(null),
            baggage: joi_1.default.string().required().allow("").allow(null),
            departure_date: joi_1.default.date().required().allow("").allow(null),
            departure_time: joi_1.default.string().required().allow("").allow(null),
            departure_terminal: joi_1.default.string().optional().allow("").allow(null),
            arrival_date: joi_1.default.date().required().allow("").allow(null),
            arrival_time: joi_1.default.string().required().allow("").allow(null),
            arrival_terminal: joi_1.default.string().optional().allow("").allow(null),
            aircraft: joi_1.default.string().optional().allow("").allow(null),
        });
        // Traveler schema
        this.travelerSchema = joi_1.default.object({
            key: joi_1.default.string().required(),
            type: joi_1.default.string()
                .valid("ADT", "CHD", "INF", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11")
                .required().allow("").allow(null),
            reference: joi_1.default.string().valid("Mr", "Mrs", "Ms", "Miss", "MSTR").required().allow("").allow(null),
            first_name: joi_1.default.string().required().allow("").allow(null),
            last_name: joi_1.default.string().required().allow("").allow(null),
            phone: joi_1.default.string().optional().allow("").allow(null),
            email: joi_1.default.string().email().lowercase().trim().optional().allow("").allow(null),
            date_of_birth: joi_1.default.date().optional().allow("").allow(null),
            gender: joi_1.default.string().valid("Male", "Female").required().allow("").allow(null),
            passport_number: joi_1.default.string().optional().allow("").allow(null),
            passport_expiry_date: joi_1.default.date().optional().allow("").allow(null),
            issuing_country: joi_1.default.number().optional().allow("").allow(null),
            nationality: joi_1.default.number().optional().allow("").allow(null),
            frequent_flyer_airline: joi_1.default.string().optional().allow("").allow(null),
            frequent_flyer_number: joi_1.default.string().optional().allow("").allow(null),
            ticket_number: joi_1.default.string().optional().allow("").allow(null),
            visa_file: joi_1.default.string().optional().allow("").allow(null),
            passport_file: joi_1.default.string().optional().allow("").allow(null),
        });
        // Manual Booking Main Schema
        this.manualBookingSchema = joi_1.default.object({
            user_id: joi_1.default.number().required(),
            api: joi_1.default.string()
                .valid(flightConstants_1.SABRE_API, flightConstants_1.TRIPJACK_API, flightConstants_1.VERTEIL_API, flightConstants_1.CUSTOM_API)
                .required(),
            pnr_code: joi_1.default.string().optional(),
            base_fare: joi_1.default.number().required(),
            total_tax: joi_1.default.number().required(),
            ait: joi_1.default.number().default(0),
            discount: joi_1.default.number().default(0),
            convenience_fee: joi_1.default.number().default(0),
            markup: joi_1.default.number().default(0),
            journey_type: joi_1.default.string()
                .valid(flightConstants_1.JOURNEY_TYPE_ONE_WAY, flightConstants_1.JOURNEY_TYPE_ROUND_TRIP, flightConstants_1.JOURNEY_TYPE_MULTI_CITY)
                .required(),
            refundable: joi_1.default.boolean().truthy("true").falsy("false").required(),
            last_time: joi_1.default.string().isoDate().optional().allow(""),
            airline_pnr: joi_1.default.string().required(),
            api_booking_ref: joi_1.default.string().optional().allow(""),
            vendor_price: this.jsonStringParser(joi_1.default.object({
                base_fare: joi_1.default.number().required(),
                tax: joi_1.default.number().required(),
                charge: joi_1.default.number(),
                discount: joi_1.default.number(),
            })).optional(),
            leg_description: this.jsonStringParser(joi_1.default.array().items(joi_1.default.object({
                departureLocation: joi_1.default.string().required(),
                arrivalLocation: joi_1.default.string().required(),
            }))).required(),
            flights: this.jsonStringParser(joi_1.default.array().items(this.flightSchema.required()).required()).required(),
            travelers: this.jsonStringParser(joi_1.default.array().items(this.travelerSchema.required()).required()).required(),
            status: joi_1.default.string()
                .valid(flightConstants_1.FLIGHT_BOOKING_CONFIRMED, flightConstants_1.FLIGHT_TICKET_ISSUE)
                .required(),
            paid: joi_1.default.boolean().when("status", {
                is: flightConstants_1.FLIGHT_TICKET_ISSUE,
                then: joi_1.default.required(),
                otherwise: joi_1.default.forbidden(),
            })
        });
        // get pnr details
        this.PnrDetails = joi_1.default.object({
            gds: joi_1.default.string().valid(flightConstants_1.SABRE_API, flightConstants_1.TRIPJACK_API).required(),
            pnr: joi_1.default.string().required(),
        });
    }
}
exports.AdminB2CFlightValidator = AdminB2CFlightValidator;
