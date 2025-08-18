"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UmrahPackageValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class UmrahPackageValidator {
    constructor() {
        this.createUmrahPackageBodyValidator = joi_1.default.object({
            id: joi_1.default.number().optional(),
            package_name: joi_1.default.string().required(),
            description: joi_1.default.string().optional(),
            package_details: joi_1.default.alternatives().try(joi_1.default.array()
                .items({
                id: joi_1.default.number().optional(),
                umrah_id: joi_1.default.number().optional(),
                details_title: joi_1.default.string().required(),
                details_description: joi_1.default.string().required(),
                type: joi_1.default.string().required(),
                status: joi_1.default.boolean().optional(),
            })
                .optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error('any.invalid');
                }
            })),
            duration: joi_1.default.number().optional(),
            is_featured: joi_1.default.boolean().optional(),
            valid_till_date: joi_1.default.date().optional(),
            group_size: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
            is_deleted: joi_1.default.boolean().optional(),
            b2b_price_per_person: joi_1.default.number().optional(),
            b2c_price_per_person: joi_1.default.number().optional(),
            b2b_discount: joi_1.default.number().optional(),
            b2c_discount: joi_1.default.number().optional(),
            b2b_discount_type: joi_1.default.string().valid('PERCENTAGE', 'FLAT').optional(),
            b2c_discount_type: joi_1.default.string().valid('PERCENTAGE', 'FLAT').optional(),
            journey_start_date: joi_1.default.date().required(),
            journey_end_date: joi_1.default.date().required(),
            itinerary: joi_1.default.string(),
            include: joi_1.default.string(),
            exclude: joi_1.default.string(),
            total_accommodation: joi_1.default.number(),
            total_destination: joi_1.default.number(),
            meeting_point: joi_1.default.string(),
            payment_policy: joi_1.default.string(),
            visa_requirements: joi_1.default.string(),
            cancellation_policy: joi_1.default.string(),
            general_remarks: joi_1.default.string().optional(),
            include_exclude: joi_1.default.string().optional().allow(''),
        });
        this.getAllUmrahPackageQueryValidator = joi_1.default.object({
            title: joi_1.default.string().allow(''),
            page: joi_1.default.number(),
            limit: joi_1.default.number(),
            to_date: joi_1.default.date().optional().allow(''),
            status: joi_1.default.boolean().optional().allow(''),
            tour_type: joi_1.default.string().optional().allow(''),
            is_deleted: joi_1.default.boolean().allow(''),
        });
        this.updateUmrahPackageBodyValidator = joi_1.default.object({
            id: joi_1.default.number().optional(),
            package_name: joi_1.default.string().required(),
            description: joi_1.default.string().optional(),
            package_details: joi_1.default.alternatives().try(joi_1.default.array()
                .items({
                id: joi_1.default.number().optional(),
                umrah_id: joi_1.default.number().optional(),
                details_title: joi_1.default.string().required(),
                details_description: joi_1.default.string().required(),
                type: joi_1.default.string().required(),
                status: joi_1.default.boolean().optional(),
            })
                .optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error('any.invalid');
                }
            })),
            duration: joi_1.default.number().optional(),
            is_featured: joi_1.default.boolean().optional(),
            valid_till_date: joi_1.default.date().optional(),
            group_size: joi_1.default.number().optional(),
            status: joi_1.default.boolean().optional(),
            b2b_price_per_person: joi_1.default.number().optional(),
            b2c_price_per_person: joi_1.default.number().optional(),
            b2b_discount: joi_1.default.number().optional(),
            b2c_discount: joi_1.default.number().optional(),
            b2b_discount_type: joi_1.default.string().valid('PERCENTAGE', 'FLAT').optional(),
            b2c_discount_type: joi_1.default.string().valid('PERCENTAGE', 'FLAT').optional(),
            journey_start_date: joi_1.default.date().optional(),
            journey_end_date: joi_1.default.date().optional(),
            itinerary: joi_1.default.string().optional(),
            include: joi_1.default.string().optional(),
            exclude: joi_1.default.string().optional(),
            total_accommodation: joi_1.default.number().optional(),
            total_destination: joi_1.default.number().optional(),
            meeting_point: joi_1.default.string().optional(),
            remove_image: joi_1.default.string().optional().allow(''),
            payment_policy: joi_1.default.string().optional(),
            visa_requirements: joi_1.default.string().optional(),
            cancellation_policy: joi_1.default.string().optional(),
            general_remarks: joi_1.default.string().optional(),
            remove_include_exclude: joi_1.default.string().optional(),
            include_exclude: joi_1.default.string().optional(),
        });
        this.createDetailDescriptionBodyValidator = joi_1.default.object({
            title: joi_1.default.string().required(),
            description: joi_1.default.string().required(),
            meta_title: joi_1.default.string().optional(),
            meta_description: joi_1.default.string().optional(),
            page: joi_1.default.string().required(),
        });
        this.umrahPackageBookingFilterQueryValidator = joi_1.default.object({
            status: joi_1.default.string(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            user_id: joi_1.default.number(),
            from_travel_date: joi_1.default.string(),
            to_travel_date: joi_1.default.string(),
            title: joi_1.default.string(),
            user_name: joi_1.default.string(),
        });
        this.umrahPackageBookingUpdate = joi_1.default.object({
            status: joi_1.default.string().valid('APPROVED', 'CANCELLED', 'PROCESSING', 'PENDING'),
        });
    }
}
exports.UmrahPackageValidator = UmrahPackageValidator;
