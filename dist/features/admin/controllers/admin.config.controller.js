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
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const admin_config_service_1 = __importDefault(require("../services/admin.config.service"));
const admin_config_validator_1 = __importDefault(require("../utils/validators/admin.config.validator"));
class AdminConfigController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new admin_config_service_1.default();
        this.AdministrationValidator = new admin_config_validator_1.default();
        //create city
        this.createCity = this.asyncWrapper.wrap({ bodySchema: this.AdministrationValidator.createCityValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createCity(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //insert visa type
        this.insertVisaType = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.insertVisaType(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all visa type
        this.getAllVisaType = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllVisaType(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //delete visa type
        this.deleteVisaType = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteVisaType(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //insert visa mode
        this.insertVisaMode = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.insertVisaMode(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all visa mode
        this.getAllVisaMode = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllVisaMode(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //delete visa mode
        this.deleteVisaMode = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteVisaMode(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get notification
        this.getNotification = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getNotification(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //insert notification seen
        this.insertNotificationSeen = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.insertNotificationSeen(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get error logs
        this.getErrorLogs = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getErrorLogs(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get audit trail
        this.getAuditTrail = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAuditTrail(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get search history
        this.getSearchHistory = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSearchHistory(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //insert airlines
        this.insertAirlines = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.insertAirlines }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.insertAirlines(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //update airlines
        this.updateAirlines = this.asyncWrapper.wrap({
            bodySchema: this.commonValidator.updateAirlines,
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAirlines(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //delete airlines
        this.deleteAirlines = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteAirlines(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //insert airport
        this.insertAirport = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.createAirportSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.insertAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all airport
        this.getAllAirport = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.airportFilterSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //update airport
        this.updateAirport = this.asyncWrapper.wrap({
            bodySchema: this.commonValidator.updateAirportSchema,
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //delete airport
        this.deleteAirport = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = AdminConfigController;
