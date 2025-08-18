"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_banner_router_1 = require("./routers/admin.banner.router");
// import { TourPackageRouter } from './routers/admin.tourpackage.router';
// import { B2CTourPackageBookingRouter } from './routers/btocTourPackageBooking.router';
const admin_tracking_router_1 = require("./routers/admin.tracking.router");
// import { B2CUmrahPackageBookingRouter } from './routers/btocUmrahPackageBooking.router';
const express_1 = require("express");
const admin_announcement_route_1 = require("./routers/admin.announcement.route");
const admin_apiAirlinesBlock_router_1 = require("./routers/admin.apiAirlinesBlock.router");
const admin_apiAirlinesCommission_router_1 = require("./routers/admin.apiAirlinesCommission.router");
const admin_b2bBookingService_router_1 = require("./routers/admin.b2bBookingService.router");
const admin_b2bRegistrationRequest_router_1 = require("./routers/admin.b2bRegistrationRequest.router");
const admin_b2cBookingSupport_router_1 = require("./routers/admin.b2cBookingSupport.router");
const admin_btoc_router_1 = require("./routers/admin.btoc.router");
const admin_commissionSet_route_1 = require("./routers/admin.commissionSet.route");
const admin_config_router_1 = __importDefault(require("./routers/admin.config.router"));
const admin_flightRouteConfig_router_1 = require("./routers/admin.flightRouteConfig.router");
const adminB2BRefundRequest_router_1 = require("./routers/adminB2BRefundRequest.router");
const adminB2BReissueRequest_router_1 = require("./routers/adminB2BReissueRequest.router");
const administration_router_1 = __importDefault(require("./routers/administration.router"));
const adminPayment_router_1 = require("./routers/adminPayment.router");
const adminPromotional_router_1 = require("./routers/adminPromotional.router");
const adminTourPackageBook_router_1 = require("./routers/adminTourPackageBook.router");
const airlineCommision_router_1 = require("./routers/airlineCommision.router");
const article_router_1 = __importDefault(require("./routers/article.router"));
const adminAgentFlight_router_1 = __importDefault(require("./routers/adminAgentRouters/adminAgentFlight.router"));
const dashboard_router_1 = __importDefault(require("./routers/dashboard.router"));
const flightBooking_router_1 = __importDefault(require("./routers/flightBooking.router"));
const manualBankTransfer_router_1 = require("./routers/manualBankTransfer.router");
const profile_router_1 = __importDefault(require("./routers/profile.router"));
const specialOffer_router_1 = require("./routers/specialOffer.router");
const tourPackage_router_1 = require("./routers/tourPackage.router");
const visa_router_1 = require("./routers/visa.router");
const adminAgentAgency_router_1 = require("./routers/adminAgentRouters/adminAgentAgency.router");
const adminDealCode_router_1 = require("./routers/adminDealCode.router");
const adminCurrency_router_1 = require("./routers/adminCurrency.router");
const adminPartialPaymentRules_router_1 = require("./routers/adminPartialPaymentRules.router");
const admin_report_router_1 = require("./routers/admin.report.router");
const adminDynamicFareRules_router_1 = require("./routers/adminDynamicFareRules.router");
const adminAirlinesPreference_router_1 = require("./routers/adminAirlinesPreference.router");
class AdminRootRouter {
    constructor() {
        this.Router = (0, express_1.Router)();
        this.ProfileRouter = new profile_router_1.default();
        this.ArticleRouter = new article_router_1.default();
        this.AirlinesCommissionRouter = new airlineCommision_router_1.AirlineCommissionRouter();
        this.VisaRouter = new visa_router_1.AdminVisaRouter();
        this.DashBoardRouter = new dashboard_router_1.default();
        this.SpecialOfferRouter = new specialOffer_router_1.SpecialOfferRouter();
        this.callRouter();
    }
    callRouter() {
        //profile
        this.Router.use('/profile', this.ProfileRouter.router);
        //administration
        this.Router.use('/administration', new administration_router_1.default().router);
        //config
        this.Router.use('/config', new admin_config_router_1.default().router);
        //article
        this.Router.use('/article', this.ArticleRouter.router);
        //airline commission
        this.Router.use('/airlines-commission', this.AirlinesCommissionRouter.router);
        //agency
        this.Router.use('/agency', new adminAgentAgency_router_1.AdminAgentAgencyRouter().router);
        //payment router
        this.Router.use('/payment', new adminPayment_router_1.PaymentRouter().router);
        //visa router
        this.Router.use('/visa', this.VisaRouter.router);
        //dashboard router
        this.Router.use('/dashboard', this.DashBoardRouter.router);
        // btoc router
        this.Router.use('/btoc', new admin_btoc_router_1.AdminBtocRouter().router);
        //b2c flight booking router
        this.Router.use('/b2c/flight-booking', new flightBooking_router_1.default().router);
        //b2b flight booking router
        this.Router.use('/b2b/flight-booking', new adminAgentFlight_router_1.default().router);
        //agency router
        this.Router.use('/booking-service', new admin_b2bBookingService_router_1.AdminBtoBBookingServiceRouter().router);
        //btoc booking support
        this.Router.use('/btoc/booking-support', new admin_b2cBookingSupport_router_1.AdminBtoCBookingSupportRouter().router);
        //promotional router
        this.Router.use('/promotion', new adminPromotional_router_1.AdminPromotionalRouter().router);
        // banner
        this.Router.use('/banner', new admin_banner_router_1.AdminBannerRouter().router);
        // tour package
        this.Router.use('/tour-package', new tourPackage_router_1.TourPackageRouter().router);
        // umrah package
        // this.Router.use('/umrah-package', new UmrahPackageRouter().router);
        // btoc tour package
        this.Router.use('/tour-package-booking', new adminTourPackageBook_router_1.adminTourPackageBookingRouter().router);
        //umrah package booking
        // this.Router.use(
        //   '/umrah-package-booking',
        //   new adminUmrahPackageBookingRouter().router
        // )
        // tracking
        this.Router.use('/tracking', new admin_tracking_router_1.TrackingRouter().router);
        //flight route config
        this.Router.use('/route-config', new admin_flightRouteConfig_router_1.AdminFlightRouteConfigRouter().router);
        //Flight api airlines commission
        this.Router.use('/flight-api', new admin_apiAirlinesCommission_router_1.AdminAPIAirlinesCommissionRouter().router);
        //Commission set router
        this.Router.use('/commission-set', new admin_commissionSet_route_1.AdminCommissionSetRouter().router);
        //b2c booking request router
        // this.Router.use('/b2c/booking-request', new AdminBookingRequestRouter().router);
        //special offer
        this.Router.use('/special-offer', this.SpecialOfferRouter.router);
        //announcement
        this.Router.use('/announcement', new admin_announcement_route_1.AdminAnnouncementRouter().router);
        //manual bank transfer router
        this.Router.use('/manual-bank-transfer', new manualBankTransfer_router_1.ManualBankTransferRouter().router);
        // b2b registration request
        this.Router.use('/b2b/registration-request', new admin_b2bRegistrationRequest_router_1.AdminB2BRegistrationRequestRouter().router);
        // api airlines block router
        this.Router.use('/airlines-block', new admin_apiAirlinesBlock_router_1.AdminAPIAirlinesBlockRouter().router);
        //b2b refund request
        this.Router.use('/b2b/refund-request', new adminB2BRefundRequest_router_1.AdminB2BRefundRequestRouter().router);
        //b2b reissue request
        this.Router.use('/b2b/reissue-request', new adminB2BReissueRequest_router_1.AdminB2BReissueRequestRouter().router);
        //deal code
        this.Router.use('/deal-code', new adminDealCode_router_1.AdminDealCodeRouter().router);
        //currency
        this.Router.use('/currency', new adminCurrency_router_1.AdminCurrencyRouter().router);
        //currency
        this.Router.use('/partial-payment-rules', new adminPartialPaymentRules_router_1.AdminPartialPaymentRuleRouter().router);
        //dynamic fare rules
        this.Router.use('/dynamic-fare-rules', new adminDynamicFareRules_router_1.AdminDynamicFareRulesRouter().router);
        //dynamic fare rules
        this.Router.use('/airlines-preference', new adminAirlinesPreference_router_1.AdminAirlinesPreferenceRouter().router);
        //report
        this.Router.use('/report', new admin_report_router_1.AdminReportRouter().router);
    }
}
exports.default = AdminRootRouter;
