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
exports.PaymentController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const adminPayment_service_1 = require("../services/adminPayment.service");
const adminAgentPayment_validator_1 = require("../utils/validators/adminAgentValidators/adminAgentPayment.validator");
class PaymentController extends abstract_controller_1.default {
    constructor() {
        super();
        this.services = new adminPayment_service_1.PaymentService();
        this.validator = new adminAgentPayment_validator_1.AdminAgentPaymentValidator();
        //get invoice list for admin
        this.getB2CInvoiceList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getB2CInvoiceList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get single invoice for admin
        this.getB2CSingleInvoice = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getB2CSingleInvoice(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //get invoice list for admin
        this.getB2BInvoiceList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getB2BInvoice(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get single invoice for admin
        this.getB2BSingleInvoice = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getB2BSingleInvoice(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get partial payment list
        this.getPartialPaymentList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getPartialPaymentList(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.giveAgencyLoan = this.asyncWrapper.wrap({ bodySchema: this.validator.giveAgencyLoanValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.giveAgencyLoan(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAgenciesWithLoan = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAgenciesWithLoan(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.getAgencyLoanHistory = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAgencyLoanHistory(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.adjustAgencyLoan = this.asyncWrapper.wrap({ bodySchema: this.validator.adjustAgencyLoanValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.adjustAgencyLoan(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        //=========================== agency loan ===========================//
        this.getLoanRequest = this.asyncWrapper.wrap({ querySchema: this.validator.getLoanRequestQuery }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getLoanRequest(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.updateLoanRequest = this.asyncWrapper.wrap({
            bodySchema: this.validator.updateLoanReq,
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.updateLoanRequest(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        this.clearPartialPaymentDue = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.clearPartialPaymentDue(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // payment link
        this.createPaymentLink = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.createPaymentLink }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.createPaymentLink(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // get payment links
        this.getPaymentLinks = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.services.getAllPaymentLink(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
    }
}
exports.PaymentController = PaymentController;
