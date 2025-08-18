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
const publicPayment_service_1 = __importDefault(require("../services/publicPayment.service"));
const publicBkash_service_1 = __importDefault(require("../services/publicBkash.service"));
const publicSSL_service_1 = __importDefault(require("../services/publicSSL.service"));
class PublicPaymentController extends abstract_controller_1.default {
    constructor() {
        super();
        this.PaymentService = new publicPayment_service_1.default();
        this.BkashService = new publicBkash_service_1.default();
        this.sslService = new publicSSL_service_1.default();
        //payment failed
        this.paymentFailed = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.PaymentService.paymentFailed(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.redirect_url) {
                res.status(code).redirect(rest.redirect_url);
            }
            else {
                res.status(code).json(rest);
            }
        }));
        //payment success
        this.paymentSuccess = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const result = yield this.PaymentService.paymentSuccess(req);
            if (result) {
                const { code } = result, rest = __rest(result, ["code"]);
                if (req.body.isApp) {
                    res.status(code).json(rest);
                }
                else if (rest.redirect_url) {
                    res.status(code).redirect(rest.redirect_url);
                }
                else {
                    res.status(code).json(rest);
                }
            }
            else {
                res.status(500).json({
                    success: false,
                    message: "An unexpected error occurred.",
                });
            }
        }));
        // payment cancelled
        this.paymentCancelled = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.PaymentService.paymentCancelled(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.redirect_url) {
                res.status(code).redirect(rest.redirect_url);
            }
            else {
                res.status(code).json(rest);
            }
        }));
        //brac bank payment confirm
        this.b2cBracBankPaymentConfirm = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.PaymentService.b2cBracBankPaymentConfirm(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (req.body.is_app) {
                res.status(code).json(rest);
            }
            else if (rest.redirect_url) {
                res.status(code).redirect(String(rest.redirect_url));
            }
            else {
                res.status(code).json(rest);
            }
        }));
        //brac bank payment cancel
        this.bracBankPaymentCancel = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.PaymentService.b2cBracBankPaymentCancel(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).redirect(rest.redirect_url);
        }));
        //payment success
        this.btobBracPaymentSuccess = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.PaymentService.btobBracPaymentSuccess(req), { code } = _a, rest = __rest(_a, ["code"]);
            console.log(rest.redirect_url, "redirect_url");
            if (rest.redirect_url) {
                res.status(code).redirect(rest.redirect_url);
            }
            else {
                res.status(code).json(rest);
            }
        }));
        //payment cancelled
        this.btobBracPaymentCancelled = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.PaymentService.btobBracPaymentCancelled(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.redirect_url) {
                res.status(code).redirect(rest.redirect_url);
            }
            else {
                res.status(code).json(rest);
            }
        }));
        //payment failed
        this.btobBracPaymentFailed = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.PaymentService.btobBracPaymentFailed(req), { code } = _a, rest = __rest(_a, ["code"]);
            if (rest.redirect_url) {
                res.status(code).redirect(rest.redirect_url);
            }
            else {
                res.status(code).json(rest);
            }
        }));
        // BKASH CALL BACK URL
        this.b2cBkashCallbackUrl = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = __rest(yield this.BkashService.B2cBkashCallbackUrl(req, res), []);
        }));
        // creadit load callback url
        this.B2bBkashCallbackUrl = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = __rest(yield this.BkashService.B2bBkashCallbackUrl(req, res), []);
        }));
        // get single payments link
        this.getSinglePaymentLink = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.PaymentService.getSinglePaymentLink(req), { code } = _a, rest = __rest(_a, ["code"]);
            res.status(code).json(rest);
        }));
        // b2b ssl success
        this.b2bSslSuccess = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = __rest(yield this.sslService.b2bPaymentSuccess(req), []);
            if (data.redirect_url) {
                res.status(data.code).redirect(data.redirect_url);
            }
            else {
                res.status(data.code).json(data);
            }
        }));
        // b2b ssl failed
        this.b2bSslFailed = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = __rest(yield this.sslService.b2bPaymentFailed(req), []);
            if (data.redirect_url) {
                res.status(data.code).redirect(data.redirect_url);
            }
            else {
                res.status(data.code).json(data);
            }
        }));
        // b2b ssl cancelled
        this.b2bSslCancelled = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = __rest(yield this.sslService.b2bPaymentCancelled(req), []);
            if (data.redirect_url) {
                res.status(data.code).redirect(data.redirect_url);
            }
            else {
                res.status(data.code).json(data);
            }
        }));
        // b2c ssl success
        this.b2cSslSuccess = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = __rest(yield this.sslService.b2cPaymentSuccess(req), []);
            if (data.redirect_url) {
                res.status(data.code).redirect(data.redirect_url);
            }
            else {
                res.status(data.code).json(data);
            }
        }));
        // b2c ssl failed
        this.b2cSslFailed = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = __rest(yield this.sslService.b2cPaymentFailed(req), []);
            if (data.redirect_url) {
                res.status(data.code).redirect(data.redirect_url);
            }
            else {
                res.status(data.code).json(data);
            }
        }));
        // b2c ssl cancelled
        this.b2cSslCancelled = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = __rest(yield this.sslService.b2cPaymentCancelled(req), []);
            if (data.redirect_url) {
                res.status(data.code).redirect(data.redirect_url);
            }
            else {
                res.status(data.code).json(data);
            }
        }));
    }
}
exports.default = PublicPaymentController;
