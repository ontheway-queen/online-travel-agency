"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authChecker_1 = __importDefault(require("../../../middleware/authChecker/authChecker"));
const agentRegistrationRequest_controller_1 = require("../../agent/controllers/agentRegistrationRequest.controller");
const auth_agent_controller_1 = __importDefault(require("../controller/auth.agent.controller"));
class AgentAuthRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.AgentAuthController = new auth_agent_controller_1.default();
        this.authChecker = new authChecker_1.default();
        this.registrationRequestController = new agentRegistrationRequest_controller_1.B2bRegistrationRequestController();
        this.callRouter();
    }
    callRouter() {
        //login
        this.router.route("/login").post(this.AgentAuthController.login);
        //verify otp
        this.router.route("/verify-otp").post(this.AgentAuthController.verifyOTP);
        //resend otp
        this.router.route("/resend-otp").post(this.AgentAuthController.resendOTP);
        //forget password
        this.router
            .route("/forget-password")
            .post(this.AgentAuthController.forgetPassword);
        // b2b registration request
        this.router.route("/registration-request").post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_FILES), this.registrationRequestController.createB2bRegistrationRequest);
        // verify registration request
        this.router.route("/verify-registration-request").post(this.registrationRequestController.verifyRegistrationRequest);
    }
}
exports.default = AgentAuthRouter;
