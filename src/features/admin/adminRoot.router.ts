import { AdminBannerRouter } from './routers/admin.banner.router';
// import { TourPackageRouter } from './routers/admin.tourpackage.router';
// import { B2CTourPackageBookingRouter } from './routers/btocTourPackageBooking.router';
import { TrackingRouter } from './routers/admin.tracking.router';
// import { B2CUmrahPackageBookingRouter } from './routers/btocUmrahPackageBooking.router';
import { Router } from 'express';
import { AdminAnnouncementRouter } from './routers/admin.announcement.route';
import { AdminAPIAirlinesBlockRouter } from './routers/admin.apiAirlinesBlock.router';
import { AdminAPIAirlinesCommissionRouter } from './routers/admin.apiAirlinesCommission.router';
import { AdminBtoBBookingServiceRouter } from './routers/admin.b2bBookingService.router';
import { AdminB2BRegistrationRequestRouter } from './routers/admin.b2bRegistrationRequest.router';
import { AdminBtoCBookingSupportRouter } from './routers/admin.b2cBookingSupport.router';
import { AdminBtocRouter } from './routers/admin.btoc.router';
import { AdminCommissionSetRouter } from './routers/admin.commissionSet.route';
import AdminConfigRouter from './routers/admin.config.router';
import { AdminFlightRouteConfigRouter } from './routers/admin.flightRouteConfig.router';
import { AdminB2BRefundRequestRouter } from './routers/adminB2BRefundRequest.router';
import { AdminB2BReissueRequestRouter } from './routers/adminB2BReissueRequest.router';
import AdministrationRouter from './routers/administration.router';
import { PaymentRouter } from './routers/adminPayment.router';
import { AdminPromotionalRouter } from './routers/adminPromotional.router';
import { adminTourPackageBookingRouter } from './routers/adminTourPackageBook.router';
import { AirlineCommissionRouter } from './routers/airlineCommision.router';
import AdminArticleRouter from './routers/article.router';
import AdminB2BFlightBookingRouter from './routers/adminAgentRouters/adminAgentFlight.router';
import AdminDashboardRouter from './routers/dashboard.router';
import adminFlightBookingRouter from './routers/flightBooking.router';
import { ManualBankTransferRouter } from './routers/manualBankTransfer.router';
import AdminProfileRouter from './routers/profile.router';
import { SpecialOfferRouter } from './routers/specialOffer.router';
import { TourPackageRouter } from './routers/tourPackage.router';
import { AdminVisaRouter } from './routers/visa.router';
import { AdminAgentAgencyRouter } from './routers/adminAgentRouters/adminAgentAgency.router';
import { AdminDealCodeRouter } from './routers/adminDealCode.router';
import { AdminCurrencyRouter } from './routers/adminCurrency.router';
import { AdminPartialPaymentRuleRouter } from './routers/adminPartialPaymentRules.router';
import { AdminReportRouter } from './routers/admin.report.router';
import { AdminDynamicFareRulesRouter } from './routers/adminDynamicFareRules.router';
import { AdminAirlinesPreferenceRouter } from './routers/adminAirlinesPreference.router';

class AdminRootRouter {
  public Router = Router();
  private ProfileRouter = new AdminProfileRouter();
  private ArticleRouter = new AdminArticleRouter();
  private AirlinesCommissionRouter = new AirlineCommissionRouter();
  private VisaRouter = new AdminVisaRouter();
  private DashBoardRouter = new AdminDashboardRouter();
  private SpecialOfferRouter = new SpecialOfferRouter();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    //profile
    this.Router.use('/profile', this.ProfileRouter.router);

    //administration
    this.Router.use('/administration', new AdministrationRouter().router);

    //config
    this.Router.use('/config', new AdminConfigRouter().router);

    //article
    this.Router.use('/article', this.ArticleRouter.router);

    //airline commission
    this.Router.use('/airlines-commission', this.AirlinesCommissionRouter.router);

    //agency
    this.Router.use('/agency', new AdminAgentAgencyRouter().router);

    //payment router
    this.Router.use('/payment', new PaymentRouter().router);

    //visa router
    this.Router.use('/visa', this.VisaRouter.router);

    //dashboard router
    this.Router.use('/dashboard', this.DashBoardRouter.router);

    // btoc router
    this.Router.use('/btoc', new AdminBtocRouter().router);

    //b2c flight booking router
    this.Router.use('/b2c/flight-booking', new adminFlightBookingRouter().router);

    //b2b flight booking router
    this.Router.use('/b2b/flight-booking', new AdminB2BFlightBookingRouter().router);

    //agency router
    this.Router.use('/booking-service', new AdminBtoBBookingServiceRouter().router);

    //btoc booking support
    this.Router.use('/btoc/booking-support', new AdminBtoCBookingSupportRouter().router);

    //promotional router
    this.Router.use('/promotion', new AdminPromotionalRouter().router);

    // banner
    this.Router.use('/banner', new AdminBannerRouter().router);

    // tour package
    this.Router.use('/tour-package', new TourPackageRouter().router);

    // umrah package
    // this.Router.use('/umrah-package', new UmrahPackageRouter().router);

    // btoc tour package
    this.Router.use('/tour-package-booking', new adminTourPackageBookingRouter().router);

    //umrah package booking
    // this.Router.use(
    //   '/umrah-package-booking',
    //   new adminUmrahPackageBookingRouter().router
    // )

    // tracking
    this.Router.use('/tracking', new TrackingRouter().router);

    //flight route config
    this.Router.use('/route-config', new AdminFlightRouteConfigRouter().router);

    //Flight api airlines commission
    this.Router.use('/flight-api', new AdminAPIAirlinesCommissionRouter().router);

    //Commission set router
    this.Router.use('/commission-set', new AdminCommissionSetRouter().router);

    //b2c booking request router
    // this.Router.use('/b2c/booking-request', new AdminBookingRequestRouter().router);

    //special offer
    this.Router.use('/special-offer', this.SpecialOfferRouter.router);

    //announcement
    this.Router.use('/announcement', new AdminAnnouncementRouter().router);

    //manual bank transfer router
    this.Router.use('/manual-bank-transfer', new ManualBankTransferRouter().router);

    // b2b registration request
    this.Router.use('/b2b/registration-request', new AdminB2BRegistrationRequestRouter().router);

    // api airlines block router
    this.Router.use('/airlines-block', new AdminAPIAirlinesBlockRouter().router);

    //b2b refund request
    this.Router.use('/b2b/refund-request', new AdminB2BRefundRequestRouter().router);

    //b2b reissue request
    this.Router.use('/b2b/reissue-request', new AdminB2BReissueRequestRouter().router);

    //deal code
    this.Router.use('/deal-code', new AdminDealCodeRouter().router);

    //currency
    this.Router.use('/currency', new AdminCurrencyRouter().router);

    //currency
    this.Router.use('/partial-payment-rules', new AdminPartialPaymentRuleRouter().router);

    //dynamic fare rules
    this.Router.use('/dynamic-fare-rules', new AdminDynamicFareRulesRouter().router);

    //dynamic fare rules
    this.Router.use('/airlines-preference', new AdminAirlinesPreferenceRouter().router);

    //report
    this.Router.use('/report', new AdminReportRouter().router);
  }
}
export default AdminRootRouter;
