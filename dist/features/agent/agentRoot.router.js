"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentProfile_router_1 = __importDefault(require("./routers/agentProfile.router"));
const agentSupportTicket_router_1 = __importDefault(require("./routers/agentSupportTicket.router"));
const agentVisa_router_1 = require("./routers/agentVisa.router");
const agent_router_1 = require("./routers/agent.router");
const agentTraveler_router_1 = __importDefault(require("./routers/agentTraveler.router"));
const agentDashboard_router_1 = require("./routers/agentDashboard.router");
const agentSubAgency_router_1 = require("./routers/agentSubAgency.router");
const agentPayment_router_1 = require("./routers/agentPayment.router");
const agentAdministration_router_1 = __importDefault(require("./routers/agentAdministration.router"));
const agentFlight_router_1 = __importDefault(require("./routers/agentFlight.router"));
const agentTourPackageBTOB_router_1 = __importDefault(require("./routers/agentTourPackageBTOB.router"));
const agentTourPackageBooking_router_1 = __importDefault(require("./routers/agentTourPackageBooking.router"));
const agentUmrahPackageBTOB_router_1 = __importDefault(require("./routers/agentUmrahPackageBTOB.router"));
const agentUmrahPackageBookingBTOB_router_1 = __importDefault(require("./routers/agentUmrahPackageBookingBTOB.router"));
const agentSpecialOffer_router_1 = require("./routers/agentSpecialOffer.router");
const agentRefundRequest_router_1 = require("./routers/agentRefundRequest.router");
const agentReissueRequest_router_1 = require("./routers/agentReissueRequest.router");
class AgentRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        this.ProfileRouter = new agentProfile_router_1.default();
        this.SubAgentRouter = new agentSubAgency_router_1.BtoBSubAgencyRouter();
        this.dashboardRouter = new agentDashboard_router_1.B2BDashboardRouter();
        this.tourPackageBTOBRouter = new agentTourPackageBTOB_router_1.default();
        this.tourPackageBookingBTOBRouter = new agentTourPackageBooking_router_1.default();
        this.umrahPackageBTOBRouter = new agentUmrahPackageBTOB_router_1.default();
        this.umrahPackageBookingBTOBRouter = new agentUmrahPackageBookingBTOB_router_1.default();
        this.callRouter();
    }
    callRouter() {
        //multiple api flight
        this.Router.use("/flight", new agentFlight_router_1.default().router);
        // traveler router
        this.Router.use("/travelers", new agentTraveler_router_1.default().router);
        //profile
        this.Router.use("/profile", this.ProfileRouter.router);
        //payment router
        this.Router.use("/payment", new agentPayment_router_1.BookingPaymentRouter().router);
        //sub agent
        this.Router.use("/sub-agent", this.SubAgentRouter.router);
        //visa router
        this.Router.use("/visa-application", new agentVisa_router_1.B2BVisaRouter().router);
        //dashboard router
        this.Router.use("/dashboard", this.dashboardRouter.router);
        //booking service
        this.Router.use("/booking-service", new agentSupportTicket_router_1.default().router);
        // b2b deposit request
        this.Router.use("/", new agent_router_1.BtobRouter().router);
        // administration router
        this.Router.use("/administration", new agentAdministration_router_1.default().router);
        // tour
        this.Router.use("/tour-package", this.tourPackageBTOBRouter.router);
        // tour package booking router
        this.Router.use("/tour-package-booking", this.tourPackageBookingBTOBRouter.router);
        //umrah package
        this.Router.use("/umrah-package", this.umrahPackageBTOBRouter.router);
        // umrah package booking router
        this.Router.use("/umrah-package-booking", this.umrahPackageBookingBTOBRouter.router);
        // special offer router
        this.Router.use("/special-offer", new agentSpecialOffer_router_1.SpecialOfferBToCRouter().router);
        // refund request router
        this.Router.use("/refund-request", new agentRefundRequest_router_1.B2BRefundRequestRouter().router);
        // reissue request router
        this.Router.use("/reissue-request", new agentReissueRequest_router_1.B2BReissueRequestRouter().router);
    }
}
exports.default = AgentRootRouter;
