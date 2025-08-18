"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisaValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class VisaValidator {
    constructor() {
        //valid traveler types
        this.traveler_types = [
            'ADT',
            'INF',
            'C02',
            'C03',
            'C04',
            'C05',
            'C06',
            'C07',
            'C08',
            'C09',
            'C10',
            'C11',
        ];
        //valid traveler titles
        this.traveler_titles = ['MISS', 'MASTER', 'MS', 'MR', 'MRS'];
        //visa application traveler schema
        this.travelerSchema = joi_1.default.object({
            key: joi_1.default.number().required(),
            type: joi_1.default.string()
                .valid(...this.traveler_types)
                .required(),
            title: joi_1.default.string()
                .valid(...this.traveler_titles)
                .required(),
            first_name: joi_1.default.string().required(),
            last_name: joi_1.default.string().required(),
            date_of_birth: joi_1.default.date().required(),
            passport_number: joi_1.default.string().required(),
            passport_expiry_date: joi_1.default.date().required(),
            city: joi_1.default.string().optional(),
            country_id: joi_1.default.number().optional(),
            address: joi_1.default.string().optional(),
            passport_type: joi_1.default.string().optional(),
        });
        //visa application schema
        this.applicationSchema = joi_1.default.object({
            visa_id: joi_1.default.number().required(),
            from_date: joi_1.default.date().optional(),
            to_date: joi_1.default.date().optional(),
            nationality: joi_1.default.string().required(),
            residence: joi_1.default.string().required(),
            traveler: joi_1.default.number().required(),
            contact_email: joi_1.default.string().required().email().lowercase().trim(),
            contact_number: joi_1.default.string().required().max(20),
            whatsapp_number: joi_1.default.string().optional().max(20),
            passengers: joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsed = JSON.parse(value);
                    const passengersSchema = joi_1.default.array()
                        .items(this.travelerSchema);
                    const { error } = passengersSchema.validate(parsed);
                    if (error)
                        throw new Error(error.details[0].message);
                    return parsed;
                }
                catch (err) {
                    return helpers.error('any.invalid', { message: err.message });
                }
            }),
        });
    }
}
exports.VisaValidator = VisaValidator;
