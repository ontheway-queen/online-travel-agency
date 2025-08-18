"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class AdminFlightRouteConfigValidator {
    constructor() {
        this.createRoutesCommissionSchema = joi_1.default.object({
            routes: joi_1.default.array()
                .items(joi_1.default.object({
                departure: joi_1.default.string().required().length(3),
                arrival: joi_1.default.string().required().length(3),
                airline: joi_1.default.string().required().length(2),
                commission: joi_1.default.number().required(),
                com_type: joi_1.default.string().required().valid('PER', 'FLAT'),
                com_mode: joi_1.default.string().required().valid('INCREASE', 'DECREASE'),
                one_way: joi_1.default.boolean().required(),
                round_trip: joi_1.default.boolean().required(),
            }))
                .min(1),
        });
        this.getRoutesCommissionSchema = joi_1.default.object({
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            status: joi_1.default.boolean(),
            departure: joi_1.default.string(),
            arrival: joi_1.default.string(),
            one_way: joi_1.default.boolean(),
            round_trip: joi_1.default.boolean(),
        });
        this.updateRoutesCommissionSchema = joi_1.default.object({
            departure: joi_1.default.string().length(3),
            arrival: joi_1.default.string().length(3),
            airline: joi_1.default.string().length(2),
            commission: joi_1.default.number(),
            com_type: joi_1.default.string().valid('PER', 'FLAT'),
            com_mode: joi_1.default.string().valid('INCREASE', 'DECREASE'),
            one_way: joi_1.default.boolean(),
            round_trip: joi_1.default.boolean(),
            status: joi_1.default.boolean(),
        });
        this.updateDeleteRoutesCommissionParamsSchema = joi_1.default.object({
            commission_set_id: joi_1.default.number().required(),
            id: joi_1.default.number().required(),
        });
        this.createRoutesBlockSchema = joi_1.default.object({
            routes: joi_1.default.array()
                .items(joi_1.default.object({
                departure: joi_1.default.string().required().length(3),
                arrival: joi_1.default.string().required().length(3),
                airline: joi_1.default.string().required().length(2),
                one_way: joi_1.default.boolean().required(),
                round_trip: joi_1.default.boolean().required(),
                booking_block: joi_1.default.boolean().required(),
                full_block: joi_1.default.boolean().required(),
            }))
                .min(1),
        });
        this.getRoutesBlockSchema = joi_1.default.object({
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
            status: joi_1.default.boolean(),
            departure: joi_1.default.string(),
            airline: joi_1.default.string(),
            arrival: joi_1.default.string(),
            one_way: joi_1.default.boolean(),
            round_trip: joi_1.default.boolean(),
            booking_block: joi_1.default.boolean(),
            full_block: joi_1.default.boolean(),
        });
        this.updateRoutesBlockSchema = joi_1.default.object({
            departure: joi_1.default.string().length(3),
            arrival: joi_1.default.string().length(3),
            airline: joi_1.default.string().length(2),
            one_way: joi_1.default.boolean(),
            round_trip: joi_1.default.boolean(),
            booking_block: joi_1.default.boolean(),
            full_block: joi_1.default.boolean(),
            status: joi_1.default.boolean(),
        });
    }
}
exports.default = AdminFlightRouteConfigValidator;
