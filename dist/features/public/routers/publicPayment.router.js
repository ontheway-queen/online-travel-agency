"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const publicPayment_controller_1 = __importDefault(require("../controllers/publicPayment.controller"));
class PublicPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.Controller = new publicPayment_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/failed").post(this.Controller.paymentFailed);
        this.router.route("/success").post(this.Controller.paymentSuccess);
        this.router.route("/cancelled").post(this.Controller.paymentCancelled);
        this.router
            .route("/brac/payment-confirm/:ref_id")
            .post(this.Controller.b2cBracBankPaymentConfirm);
        this.router
            .route("/brac/payment-cancel/:ref_id")
            .post(this.Controller.bracBankPaymentCancel);
        // brac payment success for btob
        this.router
            .route("/btob/brc/success")
            .post(this.Controller.btobBracPaymentSuccess);
        // brac payment cancelled for btob
        this.router
            .route("/btob/brc/cancelled")
            .post(this.Controller.btobBracPaymentCancelled);
        // brac payment failed for btob
        this.router
            .route("/btob/brc/failed")
            .post(this.Controller.btobBracPaymentFailed);
        // b2c bkash callback url
        this.router
            .route("/b2c/bkash-callback-url")
            .get(this.Controller.b2cBkashCallbackUrl);
        // b2b bkash callback url
        this.router
            .route("/b2b/bkash-callback-url")
            .get(this.Controller.B2bBkashCallbackUrl);
        this.router
            .route("/payment-link/:id")
            .get(this.Controller.getSinglePaymentLink);
        //SSL
        this.router.route("/b2b/ssl/success").post(this.Controller.b2bSslSuccess);
        this.router.route("/b2b/ssl/failed").post(this.Controller.b2bSslFailed);
        this.router.route("/b2b/ssl/cancelled").post(this.Controller.b2bSslCancelled);
        this.router.route("/b2c/ssl/success").post(this.Controller.b2cSslSuccess);
        this.router.route("/b2c/ssl/failed").post(this.Controller.b2cSslFailed);
        this.router.route("/b2c/ssl/cancelled").post(this.Controller.b2cSslCancelled);
    }
}
exports.default = PublicPaymentRouter;
