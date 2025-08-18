"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourPackageValidator = void 0;
const joi_1 = __importDefault(require("joi"));
class TourPackageValidator {
    constructor() {
        this.tourPackage = joi_1.default.object({
            city_id: joi_1.default.number().integer().required(),
            title: joi_1.default.string().required(),
            details: joi_1.default.string().required(),
            tour_type: joi_1.default.string().required(),
            duration: joi_1.default.number().integer().min(1).required(),
            adult_price: joi_1.default.number().positive().required(),
            child_price: joi_1.default.number().positive().required(),
            discount: joi_1.default.number().positive().optional().default(0),
            discount_type: joi_1.default.string().optional(),
            valid_till_date: joi_1.default.date().required(),
            group_size: joi_1.default.number().integer().min(1).required(),
            include_exclude: joi_1.default.string()
                // .items(
                //   Joi.object({
                //     type: Joi.string().valid('INCLUDED', 'EXCLUDED').required(),
                //     title: Joi.string().required(),
                //   })
                // )
                .required(),
            tour_package_itinerary: joi_1.default.string()
                // .custom((value: string, helper: CustomHelpers) => {})
                // .required()
                // .items(
                //   Joi.object({
                //     day: Joi.string().required(),
                //     title: Joi.string().required(),
                //     details: Joi.string().required(),
                //   })
                // )
                .required(),
            tour_package_photos: joi_1.default.string()
                // .items(
                //   Joi.object({
                //     details: Joi.string().required(),
                //   })
                // )
                .required(),
            photos: joi_1.default.array().items(joi_1.default.string().required()).min(1), // This handles photo_1, photo_2, etc.
            itn_photos: joi_1.default.array().items(joi_1.default.string().required()).min(1), // This handles itn_photo_1, itn_photo_2, etc.
        });
        this.tourPackageUpdate = joi_1.default.object({
            city_id: joi_1.default.number().integer().optional(),
            title: joi_1.default.string().optional(),
            delete_itinerary_photo: joi_1.default.string().optional(),
            delete_include_exclude: joi_1.default.string().optional(),
            delete_tour_photo: joi_1.default.string().optional(),
            details: joi_1.default.string().optional(),
            tour_type: joi_1.default.string().optional(),
            duration: joi_1.default.number().integer().min(1).optional(),
            adult_price: joi_1.default.number().positive().optional(),
            child_price: joi_1.default.number().positive().optional(),
            discount: joi_1.default.number().positive().optional().default(0).optional(),
            discount_type: joi_1.default.string().optional(),
            valid_till_date: joi_1.default.date().optional(),
            group_size: joi_1.default.number().integer().min(1).optional(),
            include_exclude: joi_1.default.string()
                // .items(
                //   Joi.object({
                //     type: Joi.string().valid('INCLUDED', 'EXCLUDED').required(),
                //     title: Joi.string().required(),
                //   })
                // )
                .optional(),
            tour_package_itinerary: joi_1.default.string()
                // .items(
                //   Joi.object({
                //     day: Joi.string().required(),
                //     title: Joi.string().required(),
                //     details: Joi.string().required(),
                //   })
                // )
                .optional(),
            tour_package_photos: joi_1.default.string()
                // .items(
                //   Joi.object({
                //     details: Joi.string().required(),
                //   })
                // )
                .optional(),
            photos: joi_1.default.array().items(joi_1.default.string().optional()).min(1), // This handles photo_1, photo_2, etc.
            itn_photos: joi_1.default.array().items(joi_1.default.string().optional()).min(1), // This handles itn_photo_1, itn_photo_2, etc.
        });
        this.tourPackageFilterQueryValidator = joi_1.default.object({
            title: joi_1.default.string(),
            country_id: joi_1.default.number(),
            city_id: joi_1.default.number(),
            tour_type: joi_1.default.string(),
            valid_till_date: joi_1.default.date(),
            is_featured: joi_1.default.boolean(),
            from_range: joi_1.default.string(),
            sort_by: joi_1.default.string(),
            from_date: joi_1.default.string(),
            to_date: joi_1.default.string(),
            to_range: joi_1.default.string(),
            status: joi_1.default.boolean(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
        this.tourPackageBookingFilterQueryValidator = joi_1.default.object({
            status: joi_1.default.string(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            user_id: joi_1.default.number(),
            from_travel_date: joi_1.default.string(),
            to_travel_date: joi_1.default.string(),
            title: joi_1.default.string(),
            user_name: joi_1.default.string(),
        });
        this.closeBookingSupport = joi_1.default.object({
            status: joi_1.default.string(),
        });
        //create tour package schema version 2
        this.createTourPackageSchemaV2 = joi_1.default.object({
            city_id: joi_1.default.number().integer().required(),
            type: joi_1.default.string().valid("b2b", "b2c", "both").required(),
            title: joi_1.default.string().required(),
            details: joi_1.default.string().optional(),
            tour_type: joi_1.default.string().valid("international", "domestic").required(),
            duration: joi_1.default.number().integer().min(1).required(),
            b2b_adult_price: joi_1.default.number().positive().required(),
            b2c_adult_price: joi_1.default.number().positive().required(),
            b2b_child_price: joi_1.default.number().positive().optional(),
            b2c_child_price: joi_1.default.number().positive().optional(),
            b2b_discount: joi_1.default.number().min(0).optional().default(0),
            b2c_discount: joi_1.default.number().min(0).optional().default(0),
            b2b_discount_type: joi_1.default.string()
                .valid("PERCENTAGE", "FLAT")
                .when("b2b_discount", {
                is: joi_1.default.number().default(0),
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional(),
            }),
            b2c_discount_type: joi_1.default.string()
                .valid("PERCENTAGE", "FLAT")
                .when("b2c_discount", {
                is: joi_1.default.number().default(0),
                then: joi_1.default.required(),
                otherwise: joi_1.default.optional(),
            }),
            valid_till_date: joi_1.default.date().required(),
            group_size: joi_1.default.number().integer().min(1).required(),
            include_services: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.string().required()).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    console.error("Error parsing include services field:", error);
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            exclude_services: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.string().required()).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    console.error("Error parsing exclude services field:", error);
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            highlights: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.string().required()).required(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    console.error("Error parsing highlights field:", error);
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            itinerary: joi_1.default.string().required(),
            cancellation_policy: joi_1.default.string().optional(),
            tax: joi_1.default.string().optional(),
            general_condition: joi_1.default.string().optional(),
            installment: joi_1.default.string().optional(),
        });
        //update tour package schema version 2
        this.updateTourPackageSchemaV2 = joi_1.default.object({
            city_id: joi_1.default.number().integer().optional(),
            type: joi_1.default.string().valid("b2b", "b2c", "both").optional(),
            title: joi_1.default.string().optional(),
            details: joi_1.default.string().optional(),
            tour_type: joi_1.default.string().valid("international", "domestic").optional(),
            duration: joi_1.default.number().integer().min(1).optional(),
            b2b_adult_price: joi_1.default.number().positive().optional(),
            b2c_adult_price: joi_1.default.number().positive().optional(),
            b2b_child_price: joi_1.default.number().positive().optional(),
            b2c_child_price: joi_1.default.number().positive().optional(),
            b2b_discount: joi_1.default.number().positive().optional().default(0),
            b2c_discount: joi_1.default.number().positive().optional().default(0),
            b2b_discount_type: joi_1.default.string().valid("PERCENTAGE", "FLAT").optional(),
            b2c_discount_type: joi_1.default.string().valid("PERCENTAGE", "FLAT").optional(),
            valid_till_date: joi_1.default.date().optional(),
            group_size: joi_1.default.number().integer().min(1).optional(),
            // include_services: Joi.alternatives()
            //   .try(
            //     Joi.array().items(Joi.string().required()).required(),
            //     Joi.string().custom((value, helpers) => {
            //       try {
            //         const parsedDeduction = JSON.parse(value);
            //         return parsedDeduction;
            //       } catch (error) {
            //         console.error("Error parsing include services field:", error);
            //         return helpers.error("any.invalid");
            //       }
            //     })
            //   ).required(),
            // exclude_services: Joi.alternatives()
            //   .try(
            //     Joi.array().items(Joi.string().required()).required(),
            //     Joi.string().custom((value, helpers) => {
            //       try {
            //         const parsedDeduction = JSON.parse(value);
            //         return parsedDeduction;
            //       } catch (error) {
            //         console.error("Error parsing exclude services field:", error);
            //         return helpers.error("any.invalid");
            //       }
            //     })
            //   ).required(),
            // highlights: Joi.alternatives()
            //   .try(
            //     Joi.array().items(Joi.string().required()).required(),
            //     Joi.string().custom((value, helpers) => {
            //       try {
            //         const parsedDeduction = JSON.parse(value);
            //         return parsedDeduction;
            //       } catch (error) {
            //         console.error("Error parsing highlights field:", error);
            //         return helpers.error("any.invalid");
            //       }
            //     })
            //   ).required(),
            itinerary: joi_1.default.string().optional(),
            cancellation_policy: joi_1.default.string().optional(),
            tax: joi_1.default.string().optional(),
            general_condition: joi_1.default.string().optional(),
            installment: joi_1.default.string().optional(),
            delete_photos: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.number().optional()).optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            add_include_service: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.string().optional()).optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            add_exclude_service: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.string().optional()).optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            add_highlight_service: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.string().optional()).optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            update_include_service: joi_1.default.alternatives()
                .try(joi_1.default.array()
                .items({
                id: joi_1.default.number().optional(),
                title: joi_1.default.string().optional(),
            })
                .optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            update_exclude_service: joi_1.default.alternatives()
                .try(joi_1.default.array()
                .items({
                id: joi_1.default.number().required(),
                title: joi_1.default.string().required(),
            })
                .optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            update_highlight_service: joi_1.default.alternatives()
                .try(joi_1.default.array()
                .items({
                id: joi_1.default.number().required(),
                title: joi_1.default.string().required(),
            })
                .optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            delete_include_service: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.number().optional()).optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            delete_exclude_service: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.number().optional()).optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
            delete_highlight_service: joi_1.default.alternatives()
                .try(joi_1.default.array().items(joi_1.default.number().optional()).optional(), joi_1.default.string().custom((value, helpers) => {
                try {
                    const parsedDeduction = JSON.parse(value);
                    return parsedDeduction;
                }
                catch (error) {
                    return helpers.error("any.invalid");
                }
            }))
                .optional(),
        });
        this.createTourPackageReview = joi_1.default.object({
            booking_id: joi_1.default.number().optional(),
            rating: joi_1.default.number().min(1).max(5).required(),
            details: joi_1.default.string().optional(),
        });
    }
}
exports.TourPackageValidator = TourPackageValidator;
