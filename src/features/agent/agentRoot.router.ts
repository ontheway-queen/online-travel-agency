import { Router } from "express";
import BookingProfileRouter from "./routers/agentProfile.router";
import BtoBBookingServiceRouter from "./routers/agentSupportTicket.router";
import { B2BVisaRouter } from "./routers/agentVisa.router";
import { BtobRouter } from "./routers/agent.router";
import BtobTravelerRouter from "./routers/agentTraveler.router";
import { B2BDashboardRouter } from "./routers/agentDashboard.router";
import { BtoBSubAgencyRouter } from "./routers/agentSubAgency.router";
import { BookingPaymentRouter } from "./routers/agentPayment.router";
import BtobAdministrationRouter from "./routers/agentAdministration.router";
import AuthChecker from "../../middleware/authChecker/authChecker";
import AgentFlightRouter from "./routers/agentFlight.router";
import tourPackageBTOBRouter from "./routers/agentTourPackageBTOB.router";
import tourPackageBookingBTOBRouter from "./routers/agentTourPackageBooking.router";
import UmrahPackageBTOBRouter from "./routers/agentUmrahPackageBTOB.router";
import UmrahPackageBookingBTOBRouter from "./routers/agentUmrahPackageBookingBTOB.router";
import { SpecialOfferBToCRouter } from "./routers/agentSpecialOffer.router";
import { B2BRefundRequestRouter } from "./routers/agentRefundRequest.router";
import { B2BReissueRequestRouter } from "./routers/agentReissueRequest.router";

class AgentRootRouter {
  public Router = Router();

  private ProfileRouter = new BookingProfileRouter();
  private SubAgentRouter = new BtoBSubAgencyRouter();
  private dashboardRouter = new B2BDashboardRouter();
  private tourPackageBTOBRouter = new tourPackageBTOBRouter();
  private tourPackageBookingBTOBRouter = new tourPackageBookingBTOBRouter();
  private umrahPackageBTOBRouter = new UmrahPackageBTOBRouter();
  private umrahPackageBookingBTOBRouter = new UmrahPackageBookingBTOBRouter();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    //multiple api flight
    this.Router.use("/flight", new AgentFlightRouter().router);

    // traveler router
    this.Router.use("/travelers", new BtobTravelerRouter().router);

    //profile
    this.Router.use("/profile", this.ProfileRouter.router);

    //payment router
    this.Router.use("/payment", new BookingPaymentRouter().router);

    //sub agent
    this.Router.use("/sub-agent", this.SubAgentRouter.router);

    //visa router
    this.Router.use("/visa-application", new B2BVisaRouter().router);

    //dashboard router
    this.Router.use("/dashboard", this.dashboardRouter.router);

    //booking service
    this.Router.use("/booking-service", new BtoBBookingServiceRouter().router);

    // b2b deposit request
    this.Router.use("/", new BtobRouter().router);

    // administration router
    this.Router.use("/administration", new BtobAdministrationRouter().router);

    // tour
    this.Router.use("/tour-package", this.tourPackageBTOBRouter.router);

    // tour package booking router
    this.Router.use(
      "/tour-package-booking",
      this.tourPackageBookingBTOBRouter.router
    );

    //umrah package
    this.Router.use("/umrah-package", this.umrahPackageBTOBRouter.router);

    // umrah package booking router
    this.Router.use(
      "/umrah-package-booking",
      this.umrahPackageBookingBTOBRouter.router
    );

    // special offer router
    this.Router.use("/special-offer", new SpecialOfferBToCRouter().router);

    // refund request router
    this.Router.use("/refund-request", new B2BRefundRequestRouter().router);

    // reissue request router
    this.Router.use("/reissue-request", new B2BReissueRequestRouter().router);
  }
}
export default AgentRootRouter;
