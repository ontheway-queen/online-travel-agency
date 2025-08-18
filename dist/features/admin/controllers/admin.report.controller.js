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
exports.AdminReportController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const admin_report_service_1 = require("../services/admin.report.service");
const admin_report_validator_1 = require("../utils/validators/admin.report.validator");
class AdminReportController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new admin_report_service_1.AdminReportService();
        this.validator = new admin_report_validator_1.AdminReportValidator();
        this.getB2CPaymentTransactionReport = this.asyncWrapper.wrap({
            querySchema: this.validator.B2CPaymentTransactionReportQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getB2CPaymentTransactionReport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getB2BTopUpReport = this.asyncWrapper.wrap({
            querySchema: this.validator.B2BTopUpReportQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getB2BTopUpReport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getB2BLedgerReport = this.asyncWrapper.wrap({
            querySchema: this.validator.B2BLedgerReportQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getB2BLedgerReport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getB2BSalesReport = this.asyncWrapper.wrap({
            querySchema: this.validator.B2BSalesReportQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getB2BSalesReport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getB2BTicketWiseReport = this.asyncWrapper.wrap({
            querySchema: this.validator.B2BTicketWiseReportQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getB2BTicketWiseReport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getB2BFlightBookingReport = this.asyncWrapper.wrap({
            querySchema: this.validator.B2BFlightBookingReportQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getB2BFlightBookingReport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.getB2CFlightBookingReport = this.asyncWrapper.wrap({
            querySchema: this.validator.B2CFlightBookingReportQueryValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getB2CFlightBookingReport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.AdminReportController = AdminReportController;
