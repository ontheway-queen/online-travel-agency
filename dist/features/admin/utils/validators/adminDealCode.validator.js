"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDealCodeValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const flightConstants_1 = require("../../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
class AdminDealCodeValidator {
    constructor() {
        this.create = joi_1.default.object({
            deal_code: joi_1.default.string().required(),
            api: joi_1.default.string().required().valid(flightConstants_1.VERTEIL_API, flightConstants_1.SABRE_API),
        });
        this.update = joi_1.default.object({
            deal_code: joi_1.default.string().required(),
            status: joi_1.default.boolean(),
        });
        this.get = joi_1.default.object({
            api: joi_1.default.string(),
            status: joi_1.default.boolean(),
            limit: joi_1.default.number(),
            skip: joi_1.default.number(),
        });
    }
}
exports.AdminDealCodeValidator = AdminDealCodeValidator;
