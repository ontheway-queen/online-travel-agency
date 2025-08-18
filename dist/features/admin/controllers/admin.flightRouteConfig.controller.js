"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminFlightRouteConfigController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const admin_flightRouteConfig_service_1 = require("../services/admin.flightRouteConfig.service");
const admin_fightRouteConfig_validator_1 = __importDefault(require("../utils/validators/admin.fightRouteConfig.validator"));
class AdminFlightRouteConfigController extends abstract_controller_1.default {
    constructor() {
        super();
        this.services = new admin_flightRouteConfig_service_1.AdminFlightRouteConfigService();
        this.validators = new admin_fightRouteConfig_validator_1.default();
        // Create routes commission controller
        this.createRoutesCommission = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validators.createRoutesCommissionSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.createRoutesCommission(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // Get routes commission controller
        this.getRoutesCommission = this.asyncWrapper.wrap({ querySchema: this.validators.getRoutesCommissionSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getRoutesCommission(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // Update routes commission controller
        this.updateRoutesCommission = this.asyncWrapper.wrap({
            bodySchema: this.validators.updateRoutesCommissionSchema,
            paramSchema: this.validators.updateDeleteRoutesCommissionParamsSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateRoutesCommission(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // Delete routes commission controller
        this.deleteRoutesCommission = this.asyncWrapper.wrap({ paramSchema: this.validators.updateDeleteRoutesCommissionParamsSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.deleteRoutesCommission(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // Create routes block controller
        this.createRoutesBlock = this.asyncWrapper.wrap({ bodySchema: this.validators.createRoutesBlockSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.insertBlockRoute(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // Get routes block controller
        this.getRoutesBlock = this.asyncWrapper.wrap({ querySchema: this.validators.getRoutesBlockSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getBlockRoutes(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // Update routes block controller
        this.updateRoutesBlock = this.asyncWrapper.wrap({
            bodySchema: this.validators.updateRoutesBlockSchema,
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateBlockRoutes(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // Delete routes block controller
        this.deleteRoutesBlock = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.deleteBlockRoutes(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.AdminFlightRouteConfigController = AdminFlightRouteConfigController;
