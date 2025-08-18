"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../../../../utils/miscellaneous/constants");
class B2CFlightValidator {
    constructor() {
        // dependent schema start ==============================================================================
        // Cabin Pref Schema
        this.cabinPrefSchema = joi_1.default.object({
            Cabin: joi_1.default.string().valid('1', '2', '3', '4').required(),
            PreferLevel: joi_1.default.string().required(),
        });
        // Location schema
        this.locationSchema = joi_1.default.object({
            LocationCode: joi_1.default.string().required().uppercase().messages({
                'any.required': 'Provide valid location',
            }),
        });
        /// TPA Schema
        this.tpaSchema = joi_1.default.object({
            CabinPref: this.cabinPrefSchema.required().messages({
                'any.required': 'CabinPref is required',
            }),
        });
        // Origin Destination Schema
        this.originDestSchema = joi_1.default.object({
            RPH: joi_1.default.string()
                .valid('1', '2', '3', '4', '5', '6', '7', '8', '9')
                .required()
                .messages({
                'any.required': 'Provide valid RPH',
            }),
            DepartureDateTime: joi_1.default.string()
                .pattern(new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/))
                .required()
                .messages({
                'any.required': 'Provide valid Departure date time',
                'string.pattern.base': 'Invalid departure timestamp',
                'any.custom': 'Invalid departure timestamp',
            })
                .custom((value, helpers) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const oneYearFromToday = new Date();
                oneYearFromToday.setFullYear(today.getFullYear() + 1);
                const departureDate = new Date(value);
                if (departureDate < today) {
                    return helpers.error('any.custom');
                }
                if (departureDate > oneYearFromToday) {
                    return helpers.error('any.custom');
                }
                return value;
            }),
            OriginLocation: this.locationSchema.required().messages({
                'any.required': 'Provide valid origin location',
            }),
            DestinationLocation: this.locationSchema.required().messages({
                'any.required': 'Provide valid destination location',
            }),
            TPA_Extensions: this.tpaSchema.required().messages({
                'any.required': 'TPA Extensions is required',
            }),
        });
        // Passenger Type Schema
        this.passengerTypeSchema = joi_1.default.object({
            Code: joi_1.default.string().length(3).required().messages({
                'any.required': 'Provide valid passenger',
            }),
            Quantity: joi_1.default.number().integer().required().messages({
                'any.required': 'Provide valid quantity',
                'number.integer': 'Quantity must be an integer',
            }),
        });
        // dependent schema end ==============================================================================
        // Flight search validator end
        this.flightSearchSchema = joi_1.default.object({
            JourneyType: joi_1.default.string().valid('1', '2', '3').required(),
            OriginDestinationInformation: joi_1.default.array()
                .items(this.originDestSchema.required())
                .required()
                .messages({
                'any.required': 'Provide valid Origin destination data',
            }),
            PassengerTypeQuantity: joi_1.default.array()
                .items(this.passengerTypeSchema.required())
                .required()
                .messages({
                'any.required': 'Provide valid passenger code and quantity data',
            }),
        });
        this.flightSearchSSESchema = joi_1.default.object({
            JourneyType: joi_1.default.string().valid('1', '2', '3').required(),
            OriginDestinationInformation: joi_1.default.alternatives().try(joi_1.default.array().items(this.originDestSchema.required()).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value);
                    const validationResult = joi_1.default.array().items(this.originDestSchema.required()).validate(parsedValue);
                    if (validationResult.error) {
                        return helpers.error("any.invalid");
                    }
                    return parsedValue;
                }
                catch (error) {
                    console.error("Error parsing OriginDestinationInformation:", error);
                    return helpers.error("any.invalid");
                }
            })).required().messages({
                'any.required': 'Provide valid Origin destination data',
                'any.invalid': 'Invalid format for Origin destination data',
            }),
            PassengerTypeQuantity: joi_1.default.alternatives().try(joi_1.default.array().items(this.passengerTypeSchema.required()).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value);
                    const validationResult = joi_1.default.array().items(this.passengerTypeSchema.required()).validate(parsedValue);
                    if (validationResult.error) {
                        return helpers.error("any.invalid");
                    }
                    return parsedValue;
                }
                catch (error) {
                    console.error("Error parsing PassengerTypeQuantity:", error);
                    return helpers.error("any.invalid");
                }
            })).required().messages({
                'any.required': 'Provide valid passenger code and quantity data',
                'any.invalid': 'Invalid format for passenger code and quantity data',
            }),
        });
        // Flight filter schema
        this.flightFilterSchema = joi_1.default.object({
            carrier_operating: joi_1.default.string().optional(),
            min_price: joi_1.default.number().optional(),
            max_price: joi_1.default.number().optional(),
            page: joi_1.default.number().optional(),
            search_id: joi_1.default.string().required(),
            size: joi_1.default.number().optional(),
            refundable: joi_1.default.string().optional(),
            stoppage: joi_1.default.string().optional(),
            aircraft: joi_1.default.string().optional(),
            elapsed_time_min: joi_1.default.string().optional(),
            departure_timing: joi_1.default.string().optional(),
            arrival_timing: joi_1.default.string().optional(),
            sort_by: joi_1.default.string().optional(),
            baggage: joi_1.default.string().optional(),
            min_departure_time: joi_1.default.string().optional(),
            max_departure_time: joi_1.default.string().optional(),
            min_arrival_time: joi_1.default.string().optional(),
            max_arrival_time: joi_1.default.string().optional(),
        });
        //FLIGHT SCHEMA FOR REVALIDATE
        this.flightInfoSchema = joi_1.default.object({
            departure_time: joi_1.default.string().required(),
            departure_date: joi_1.default.string().required(),
            arrival_time: joi_1.default.string().required(),
            arrival_date: joi_1.default.string().required(),
            carrier_marketing_flight_number: joi_1.default.number().required(),
            departure_airport_code: joi_1.default.string().required(),
            arrival_airport_code: joi_1.default.string().required(),
            carrier_marketing_code: joi_1.default.string().required(),
            carrier_operating_code: joi_1.default.string().required(),
        });
        //ORIGIN DESTINATION INFORMATION SCHEMA FOR REVALIDATE
        this.originDestinationInfoSchema = joi_1.default.object({
            RPH: joi_1.default.string().required(),
            DepartureDateTime: joi_1.default.string()
                .pattern(new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/))
                .required(),
            OriginLocation: this.locationSchema.required(),
            DestinationLocation: this.locationSchema.required(),
            flight: joi_1.default.array().items(this.flightInfoSchema.required()).required(),
            TPA_Extensions: this.tpaSchema.optional().messages({
                'any.required': 'TPA Extensions is required',
            }),
        });
        //FLIGHT REVALIDATE SCHEMA V2
        this.flightRevalidateSchemaV2 = joi_1.default.object({
            OriginDestinationInformation: joi_1.default.array()
                .items(this.originDestinationInfoSchema.required())
                .required(),
            PassengerTypeQuantity: joi_1.default.array()
                .items(this.passengerTypeSchema.required())
                .required(),
        });
        //FLIGHT REVALIDATE SCHEMA
        this.flightRevalidateSchema = joi_1.default.object({
            search_id: joi_1.default.string().required(),
            flight_id: joi_1.default.string().required()
        });
        //FLIGHT BOOKING PASSENGERS SCHEMA
        this.flightBookingPassengersSchema = joi_1.default.object({
            reference: joi_1.default.string().required().valid("MR", "MRS", "MS", "MASTER", "MISS", "MSTR"),
            first_name: joi_1.default.string()
                .min(2)
                .max(50)
                .pattern(/^[a-zA-Z\s\-']+$/) // Allows letters, spaces, hyphens, apostrophes
                .pattern(/^(?!.*(.)\1{3})/), // Blocks >3 repeating chars
            last_name: joi_1.default.string()
                .min(2)
                .max(50)
                .pattern(/^[a-zA-Z\s\-']+$/) // Allows letters, spaces, hyphens, apostrophes
                .pattern(/^(?!.*(.)\1{3})/), // Blocks >3 repeating chars
            type: joi_1.default.string().required().valid("ADT", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "INF"),
            date_of_birth: joi_1.default.string().optional().pattern(/^\d{4}-\d{2}-\d{2}$/)
                .messages({
                'string.pattern.base': 'date_of_birth must be in the format yyyy-mm-dd',
                'any.custom': 'date_of_birth cannot be in the future',
            })
                .custom((value, helpers) => {
                const today = new Date();
                const inputDate = new Date(value);
                if (inputDate > today) {
                    return helpers.error('any.custom');
                }
                return value;
            }),
            gender: joi_1.default.string().optional().valid("Male", "Female"),
            issuing_country: joi_1.default.number().optional(),
            nationality: joi_1.default.number().optional(),
            passport_number: joi_1.default.string().optional(),
            passport_expiry_date: joi_1.default.string().optional().pattern(/^\d{4}-\d{2}-\d{2}$/)
                .messages({
                'string.pattern.base': 'passport_expiry_date must be in the format yyyy-mm-dd',
                'any.custom': 'passport_expiry_date must be at least 6 months from the current date',
            })
                .custom((value, helpers) => {
                const today = new Date();
                const sixMonthsFromToday = new Date();
                sixMonthsFromToday.setMonth(today.getMonth() + 6);
                const expiryDate = new Date(value);
                if (expiryDate < sixMonthsFromToday) {
                    return helpers.error('any.custom');
                }
                return value;
            }),
            contact_number: joi_1.default.string().optional(),
            contact_email: joi_1.default.string().email().lowercase().trim().optional(),
            frequent_flyer_airline: joi_1.default.string().optional(),
            frequent_flyer_number: joi_1.default.string().optional(),
            passport_issuing_date: joi_1.default.date().optional(),
            passport_file: joi_1.default.string().optional(),
            visa_file: joi_1.default.string().optional(),
            save_information: joi_1.default.boolean().optional()
        }).custom((obj, helpers) => {
            // Check combined first + last name
            const fullName = `${obj.first_name.toLowerCase()} ${obj.last_name.toLowerCase()}`;
            if (constants_1.commonFakeNames.includes(fullName)) {
                return helpers.error('any.fakeName', {
                    fullName: `${obj.first_name} ${obj.last_name}`
                });
            }
            // Also check individual parts if needed
            if (constants_1.commonFakeNames.includes(obj.first_name.toLowerCase())) {
                return helpers.error('string.fakeName', { name: obj.first_name });
            }
            if (constants_1.commonFakeNames.includes(obj.last_name.toLowerCase())) {
                return helpers.error('string.fakeName', { name: obj.last_name });
            }
            return obj;
        }).messages({
            'any.fakeName': 'The name "{{#fullName}}" appears fake or generic',
            'string.fakeName': 'The name "{{#name}}" appears fake or generic'
        });
        //FLIGHT BOOKING SCHEMA
        this.flightBookingSchema = joi_1.default.object({
            search_id: joi_1.default.string().required(),
            flight_id: joi_1.default.string().required(),
            passengers: joi_1.default.array().items(this.flightBookingPassengersSchema.required()).required(),
        });
        this.flightBookingSSRSchema = joi_1.default.object({
            passenger_key: joi_1.default.number().required(),
            segment_id: joi_1.default.number().required(),
            code: joi_1.default.string().required(),
            type: joi_1.default.string().valid("meal", "baggage").required(),
            price: joi_1.default.number().required(),
            desc: joi_1.default.string().required()
        });
        //FLIGHT BOOKING SCHEMA V2 (with passport and visa file)
        this.pnrCreateSchemaV2 = joi_1.default.object({
            search_id: joi_1.default.string().required(),
            flight_id: joi_1.default.string().required(),
            passengers: joi_1.default.string()
                .required()
                .custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value);
                    if (!Array.isArray(parsedValue)) {
                        return helpers.error("passengers.invalidArray");
                    }
                    for (const passenger of parsedValue) {
                        const { error } = this.flightBookingPassengersSchema
                            .keys({
                            key: joi_1.default.number().required(),
                        })
                            .validate(passenger);
                        if (error) {
                            return helpers.error("passengers.invalidPassenger", { message: error.details[0].message });
                        }
                    }
                    return parsedValue;
                }
                catch (error) {
                    console.error("Error parsing passengers field:", error);
                    return helpers.error("passengers.invalidJSON");
                }
            }, "Validate Passengers JSON")
                .messages({
                "passengers.invalidArray": "Passengers field must be a valid array.",
                "passengers.invalidPassenger": "{{#message}}",
                "passengers.invalidJSON": "Passengers field must contain valid JSON.",
            }),
            ssr: joi_1.default.string()
                .optional()
                .custom((value, helpers) => {
                try {
                    const parsedValue = JSON.parse(value);
                    if (!Array.isArray(parsedValue)) {
                        return helpers.error('ssr.invalidArray');
                    }
                    for (const ssr of parsedValue) {
                        const { error } = this.flightBookingSSRSchema
                            .validate(ssr);
                        if (error) {
                            return helpers.error('ssr.invalidSSR', {
                                message: error.details[0].message,
                            });
                        }
                    }
                    return parsedValue;
                }
                catch (error) {
                    console.error('Error parsing ssr field:', error);
                    return helpers.error('ssr.invalidJSON');
                }
            }, 'Validate ssr JSON')
                .messages({
                'ssr.invalidArray': 'ssr field must be a valid array.',
                'ssr.invalidPassenger': '{{#message}}',
                'ssr.invalidJSON': 'ssr field must contain valid JSON.',
            }),
        });
    }
}
exports.default = B2CFlightValidator;
