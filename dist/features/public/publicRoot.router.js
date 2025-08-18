"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicEmailOTP_router_1 = __importDefault(require("./routers/publicEmailOTP.router"));
const publicCommon_router_1 = __importDefault(require("./routers/publicCommon.router"));
const publicAI_router_1 = __importDefault(require("./routers/publicAI.router"));
class PublicRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        // Router classes
        this.publicCommonRouter = new publicCommon_router_1.default();
        this.publicEmailOtpRouter = new publicEmailOTP_router_1.default();
        this.publicAIRouter = new publicAI_router_1.default();
        this.callRouter();
    }
    callRouter() {
        // Public common Routes
        this.Router.use('/common', this.publicCommonRouter.router);
        // Public email otp Routes
        this.Router.use('/email-otp', this.publicEmailOtpRouter.router);
        //Public AI Routes
        this.Router.use('/AI', this.publicAIRouter.router);
    }
}
exports.default = PublicRootRouter;
