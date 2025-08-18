"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAirlinesPreferenceValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminAirlinesPreferenceValidator {
    constructor() {
        this.createAirlinePref = joi_1.default.object({
            body: joi_1.default.array()
                .items(joi_1.default.object({
                airlines_code: joi_1.default.string().required().label('Airline code'),
                dynamic_fare_supplier_id: joi_1.default.number()
                    .integer()
                    .required()
                    .label('Supplier ID'),
                preference_type: joi_1.default.string()
                    .valid('PREFERRED', 'BLOCKED')
                    .required()
                    .label('Preference type'),
                from_dac: joi_1.default.boolean().required(),
                to_dac: joi_1.default.boolean().required(),
                domestic: joi_1.default.boolean().required(),
                soto: joi_1.default.boolean().required(),
            }))
                .min(1)
                .required()
                .label('Airline Preferences Array'),
        });
        this.getAirlinePref = joi_1.default.object({
            dynamic_fare_supplier_id: joi_1.default.number().required(),
            pref_type: joi_1.default.string().valid('PREFERRED', 'BLOCKED').optional(),
            status: joi_1.default.boolean().optional(),
            filter: joi_1.default.string().optional(),
        });
        this.updateAirlinePref = joi_1.default.object({
            preference_type: joi_1.default.string().valid('PREFERRED', 'BLOCKED').optional(),
            status: joi_1.default.boolean().optional(),
            from_dac: joi_1.default.boolean().optional(),
            to_dac: joi_1.default.boolean().optional(),
            domestic: joi_1.default.boolean().optional(),
            soto: joi_1.default.boolean().optional(),
        });
    }
}
exports.AdminAirlinesPreferenceValidator = AdminAirlinesPreferenceValidator;
