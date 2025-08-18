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
exports.BookingPaymentController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const bookingPayment_service_1 = require("../services/bookingPayment.service");
const payment_validator_1 = require("../utils/validators/payment.validator");
class BookingPaymentController extends abstract_controller_1.default {
    constructor() {
        super();
        this.service = new bookingPayment_service_1.BookingPaymentServices();
        this.validator = new payment_validator_1.AgentPaymentValidator();
        //create payment
        this.CreateB2bBkashPayment = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.CreateB2bBkashPayment(req, res), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //create payment ssl
        this.createSSLPayment = this.asyncWrapper.wrap({ bodySchema: this.validator.topupSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createSSLPayment(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get transaction
        this.getTransaction = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getTransaction(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get invoice
        this.getInvoice = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getInvoice(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get single invoice
        this.getSingleInvoice = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleInvoice(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //clear invoice due
        this.clearInvoiceDue = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.clearInvoiceDue(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // partial payment history
        this.getPartialPaymentList = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getPartialPaymentList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // total partial payment amount
        this.getPartialPaymentTotalDue = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getPartialPaymentTotalDue(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // clear loan
        this.clearLoan = this.asyncWrapper.wrap({ bodySchema: this.validator.clearLoan }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.clearLoan(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // deposit by gateway
        this.createDepositOrderByBracGateway = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createDepositOrderByBracGateway(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //============================= LOAN REQUEST ==================================//
        // create loan request
        this.createLoanRequest = this.asyncWrapper.wrap({ bodySchema: this.validator.createLoanRequest }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createLoanRequest(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // get loan request
        this.getLoanRequest = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getLoanRequest(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // get loan history
        this.getLoanHistory = this.asyncWrapper.wrap({}, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getLoanHistory(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.BookingPaymentController = BookingPaymentController;
