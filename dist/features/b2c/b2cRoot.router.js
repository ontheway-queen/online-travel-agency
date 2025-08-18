"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingProfile_router_1 = __importDefault(require("./routers/bookingProfile.router"));
const authChecker_1 = __importDefault(require("../../middleware/authChecker/authChecker"));
const bookingTraveler_router_1 = __importDefault(require("./routers/bookingTraveler.router"));
const flightBooking_router_1 = __importDefault(require("./routers/flightBooking.router"));
const ticketIssue_router_1 = __importDefault(require("./routers/ticketIssue.router"));
const bookingPayment_router_1 = require("./routers/bookingPayment.router");
const bookingVisa_router_1 = require("./routers/bookingVisa.router");
const btocBookingRequest_router_1 = __importDefault(require("./routers/btocBookingRequest.router"));
// import { TourPackageBookingRouter } from './routers/tourPackageBooking.router';
const umrahPackageBookingRouter_1 = require("./routers/umrahPackageBookingRouter");
const b2cFlight_router_1 = __importDefault(require("./routers/b2cFlight.router"));
const tourPackageBTOC_router_1 = __importDefault(require("./routers/tourPackageBTOC.router"));
const tourPackageBookingBTOC_router_1 = __importDefault(require("./routers/tourPackageBookingBTOC.router"));
const umrahPackage_router_1 = require("./routers/umrahPackage.router");
const specialOfferBToC_router_1 = require("./routers/specialOfferBToC.router");
const manualBankTransfer_router_1 = require("./routers/manualBankTransfer.router");
const bookingService_router_1 = __importDefault(require("./routers/bookingService.router"));
class B2CRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        this.TravelerRouter = new bookingTraveler_router_1.default();
        this.ProfileRouter = new bookingProfile_router_1.default();
        this.PaymentRouter = new bookingPayment_router_1.BookingPaymentRouter();
        this.TicketRouter = new ticketIssue_router_1.default();
        this.authChecker = new authChecker_1.default();
        this.specailOfferBToCRotuer = new specialOfferBToC_router_1.SpecialOfferBToCRouter();
        this.manualBankTransferRouter = new manualBankTransfer_router_1.ManualBankTransferRouter();
        this.callRouter();
    }
    callRouter() {
        // Multi API flight router
        this.Router.use('/flight', new b2cFlight_router_1.default().router);
        // traveler router
        this.Router.use('/traveler', this.authChecker.userAuthChecker, this.TravelerRouter.router);
        //profile
        this.Router.use('/profile', this.authChecker.userAuthChecker, this.ProfileRouter.router);
        //visa application router
        this.Router.use('/visa-application', this.authChecker.userAuthChecker, new bookingVisa_router_1.BookingVisaRouter().router);
        //payment router
        this.Router.use('/payment', this.authChecker.userAuthChecker, this.PaymentRouter.router);
        //flight booking request router
        this.Router.use('/flight-booking-request', this.authChecker.userAuthChecker, new btocBookingRequest_router_1.default().router);
        //flight booking router
        this.Router.use('/flight-booking', this.authChecker.userAuthChecker, new flightBooking_router_1.default().router);
        //ticket router
        this.Router.use('/ticket-issue', this.authChecker.userAuthChecker, this.TicketRouter.router);
        //booking service router
        this.Router.use('/booking-support', this.authChecker.userAuthChecker, new bookingService_router_1.default().router);
        // tour package router
        this.Router.use('/tour-package', new tourPackageBTOC_router_1.default().router);
        // umrah package router
        this.Router.use('/umrah-package', new umrahPackage_router_1.B2CUmrahPackageRouter().router);
        //tour package booking
        this.Router.use('/tour-package-booking', this.authChecker.userAuthChecker, new tourPackageBookingBTOC_router_1.default().router);
        //umrah package booking
        this.Router.use('/umrah-package-booking', this.authChecker.userAuthChecker, new umrahPackageBookingRouter_1.UmrahPackageBookingRouter().router);
        // spcecial offer
        this.Router.use('/special-offer', this.specailOfferBToCRotuer.router);
        //manual bank transfer
        this.Router.use('/manual-bank-transfer', this.authChecker.userAuthChecker, this.manualBankTransferRouter.router);
    }
}
exports.default = B2CRootRouter;
