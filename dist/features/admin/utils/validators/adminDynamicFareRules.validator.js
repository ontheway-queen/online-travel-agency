"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDynamicFareRulesValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class AdminDynamicFareRulesValidator {
    constructor() {
        this.createSet = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        this.updateSet = joi_1.default.object({
            name: joi_1.default.string().optional(),
        });
        this.cloneSet = joi_1.default.object({
            name: joi_1.default.string().required(),
        });
        this.createSupplier = joi_1.default.object({
            set_id: joi_1.default.number().required(),
            supplier_id: joi_1.default.number().required(),
            commission: joi_1.default.number().optional(),
            commission_type: joi_1.default.string().optional().valid('PER', 'FLAT'),
            markup: joi_1.default.number().optional(),
            markup_type: joi_1.default.string().optional().valid('PER', 'FLAT'),
            segment_markup: joi_1.default.number().optional(),
            segment_commission: joi_1.default.number().optional(),
            segment_commission_type: joi_1.default.string()
                .valid('PER', 'FLAT')
                .when('segment_commission', {
                is: joi_1.default.string(),
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional(),
            }),
            segment_markup_type: joi_1.default.string()
                .valid('PER', 'FLAT')
                .when('segment_markup', {
                is: joi_1.default.string(),
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional(),
            }),
            pax_markup: joi_1.default.number().precision(2).optional(),
        });
        this.getSupplier = joi_1.default.object({
            set_id: joi_1.default.number().required(),
        });
        this.updateSupplier = joi_1.default.object({
            commission: joi_1.default.number().optional(),
            commission_type: joi_1.default.string().optional().valid('PER', 'FLAT'),
            markup: joi_1.default.number().optional(),
            markup_type: joi_1.default.string().optional().valid('PER', 'FLAT'),
            status: joi_1.default.boolean().optional(),
            segment_markup: joi_1.default.number().optional(),
            segment_commission: joi_1.default.number().optional(),
            segment_commission_type: joi_1.default.string().valid('PER', 'FLAT').optional(),
            segment_markup_type: joi_1.default.string().valid('PER', 'FLAT').optional(),
            pax_markup: joi_1.default.number().precision(2).optional(),
        });
        this.createSupplierAirlinesFare = joi_1.default.object({
            body: joi_1.default.array()
                .items(joi_1.default.object({
                dynamic_fare_supplier_id: joi_1.default.number()
                    .integer()
                    .required()
                    .label('Dynamic Fare Supplier ID'),
                airline: joi_1.default.string().required().label('Airline Code'),
                from_dac: joi_1.default.boolean().optional().label('From DAC'),
                domestic: joi_1.default.boolean().optional().label('Domestic'),
                to_dac: joi_1.default.boolean().optional().label('To DAC'),
                soto: joi_1.default.boolean().optional().label('SOTO'),
                pax_markup: joi_1.default.number().precision(2).optional(),
                commission_type: joi_1.default.string()
                    .valid('PER', 'FLAT')
                    .optional()
                    .label('Commission Type'),
                commission: joi_1.default.number().precision(2).optional().label('Commission'),
                markup_type: joi_1.default.string()
                    .valid('PER', 'FLAT')
                    .optional()
                    .label('Markup Type'),
                markup: joi_1.default.number().precision(2).optional().label('Markup'),
                flight_class: joi_1.default.string()
                    .valid('ECONOMY', 'BUSINESS', 'FIRST', 'PREMIUM')
                    .optional()
                    .allow(null, '')
                    .label('Class'),
                segment_commission: joi_1.default.number()
                    .precision(2)
                    .optional()
                    .label('Segment Commission'),
                segment_commission_type: joi_1.default.string()
                    .valid('PER', 'FLAT')
                    .optional()
                    .label('Segment Commission Type'),
                segment_markup: joi_1.default.number()
                    .precision(2)
                    .optional()
                    .label('Segment Markup'),
                segment_markup_type: joi_1.default.string()
                    .valid('PER', 'FLAT')
                    .optional()
                    .label('Segment Markup Type'),
            }))
                .min(1)
                .required()
                .label('Supplier Airline Fare List'),
        });
        this.getSupplierAirlinesFare = joi_1.default.object({
            dynamic_fare_supplier_id: joi_1.default.number().required(),
        });
        this.updateSupplierAirlinesFare = joi_1.default.object({
            from_dac: joi_1.default.boolean().optional().label('From DAC'),
            to_dac: joi_1.default.boolean().optional().label('To DAC'),
            soto: joi_1.default.boolean().optional().label('SOTO'),
            domestic: joi_1.default.boolean().optional().label('Domestic'),
            commission_type: joi_1.default.string()
                .valid('PER', 'FLAT')
                .optional()
                .label('Commission Type'),
            commission: joi_1.default.number().precision(2).optional().label('Commission'),
            markup_type: joi_1.default.string()
                .valid('PER', 'FLAT')
                .optional()
                .label('Markup Type'),
            markup: joi_1.default.number().precision(2).optional().label('Markup'),
            flight_class: joi_1.default.string().optional().label('Class'),
            status: joi_1.default.boolean().optional().label('Status'),
            segment_commission: joi_1.default.number()
                .precision(2)
                .optional()
                .label('Segment Commission'),
            pax_markup: joi_1.default.number()
                .precision(2)
                .optional()
                .label('Segment Commission'),
            segment_commission_type: joi_1.default.string()
                .valid('PER', 'FLAT')
                .optional()
                .label('Segment Commission Type'),
            segment_markup: joi_1.default.number()
                .precision(2)
                .optional()
                .label('Segment Markup'),
            segment_markup_type: joi_1.default.string()
                .valid('PER', 'FLAT')
                .optional()
                .label('Segment Markup Type'),
        }).min(1);
        this.createFareTax = joi_1.default.object({
            body: joi_1.default.array()
                .items(joi_1.default.object({
                dynamic_fare_supplier_id: joi_1.default.number()
                    .integer()
                    .required()
                    .label('Dynamic Fare Supplier ID'),
                airline: joi_1.default.string().required().label('Airline Code'),
                tax_name: joi_1.default.string().required().label('Tax Name'),
                commission: joi_1.default.number().precision(2).optional().label('Commission'),
                commission_type: joi_1.default.string()
                    .valid('PER', 'FLAT')
                    .optional()
                    .label('Commission Type'),
                markup: joi_1.default.number().precision(2).optional().label('Markup'),
                markup_type: joi_1.default.string()
                    .valid('PER', 'FLAT')
                    .optional()
                    .label('Markup Type'),
                from_dac: joi_1.default.boolean().required().label('From DAC'),
                to_dac: joi_1.default.boolean().required().label('To DAC'),
                soto: joi_1.default.boolean().required().label('SOTO'),
                domestic: joi_1.default.boolean().required().label('Domestic')
            }))
                .min(1)
                .required()
                .label('Fare Tax Items'),
        });
        this.getFareTax = joi_1.default.object({
            dynamic_fare_supplier_id: joi_1.default.number().required(),
        });
        this.updateFareTax = joi_1.default.object({
            dynamic_fare_supplier_id: joi_1.default.number()
                .integer()
                .optional()
                .label('Dynamic Fare Supplier ID'),
            airline: joi_1.default.string().optional().label('Airline Code'),
            tax_name: joi_1.default.string().optional().label('Tax Name'),
            commission: joi_1.default.number().precision(2).optional().label('Commission'),
            commission_type: joi_1.default.string()
                .valid('PER', 'FLAT')
                .optional()
                .label('Commission Type'),
            markup: joi_1.default.number().precision(2).optional().label('Markup'),
            markup_type: joi_1.default.string()
                .valid('PER', 'FLAT')
                .optional()
                .label('Markup Type'),
            status: joi_1.default.boolean().optional().label('Status'),
            from_dac: joi_1.default.boolean().optional().label('From DAC'),
            to_dac: joi_1.default.boolean().optional().label('To DAC'),
            soto: joi_1.default.boolean().optional().label('SOTO'),
            domestic: joi_1.default.boolean().optional().label('Domestic')
        }).min(1);
        this.upsertBtoCSetSchema = joi_1.default.object({
            commission_set_id: joi_1.default.number().required(),
        });
    }
}
exports.AdminDynamicFareRulesValidator = AdminDynamicFareRulesValidator;
