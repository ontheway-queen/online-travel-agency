"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const publicEmailOTP_controller_1 = __importDefault(require("../controllers/publicEmailOTP.controller"));
class PublicEmailOTPRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.Controller = new publicEmailOTP_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // send email otp router
        this.router.post('/send', this.Controller.sendEmailOtpController);
        //match otp email
        this.router.post('/match', this.Controller.matchEmailOtpController);
    }
}
exports.default = PublicEmailOTPRouter;
