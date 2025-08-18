import { Router } from 'express';
import BookingProfileRouter from './routers/bookingProfile.router';
import AuthChecker from '../../middleware/authChecker/authChecker';
import BookingTravelerRouter from './routers/bookingTraveler.router';
import flightBookingRouter from './routers/flightBooking.router';
import ticketIssueRouter from './routers/ticketIssue.router';
import { BookingPaymentRouter } from './routers/bookingPayment.router';
import { BookingVisaRouter } from './routers/bookingVisa.router';
import BookingRequestRouter from './routers/btocBookingRequest.router';
// import { TourPackageBookingRouter } from './routers/tourPackageBooking.router';

import { UmrahPackageBookingRouter } from './routers/umrahPackageBookingRouter';
import MultiAPIFlightRouter from './routers/b2cFlight.router';
import tourPackageBTOCRouter from './routers/tourPackageBTOC.router';
import tourPackageBookingBTOCRouter from './routers/tourPackageBookingBTOC.router';
import { B2CUmrahPackageRouter } from './routers/umrahPackage.router';
import { SpecialOfferBToCRouter } from './routers/specialOfferBToC.router';
import { ManualBankTransferRouter } from './routers/manualBankTransfer.router';
import BtoCBookingServiceRouter from './routers/bookingService.router';

class B2CRootRouter {
  public Router = Router();

  private TravelerRouter = new BookingTravelerRouter();
  private ProfileRouter = new BookingProfileRouter();
  private PaymentRouter = new BookingPaymentRouter();
  private TicketRouter = new ticketIssueRouter();
  private authChecker = new AuthChecker();
  private specailOfferBToCRotuer = new SpecialOfferBToCRouter();
  private manualBankTransferRouter = new ManualBankTransferRouter();

  constructor() {
    this.callRouter();
  }

  private callRouter() {
    // Multi API flight router
    this.Router.use('/flight', new MultiAPIFlightRouter().router);

    // traveler router
    this.Router.use(
      '/traveler',
      this.authChecker.userAuthChecker,
      this.TravelerRouter.router
    );

    //profile
    this.Router.use(
      '/profile',
      this.authChecker.userAuthChecker,
      this.ProfileRouter.router
    );

    //visa application router
    this.Router.use(
      '/visa-application',
      this.authChecker.userAuthChecker,
      new BookingVisaRouter().router
    );

    //payment router
    this.Router.use(
      '/payment',
      this.authChecker.userAuthChecker,
      this.PaymentRouter.router
    );

    //flight booking request router
    this.Router.use(
      '/flight-booking-request',
      this.authChecker.userAuthChecker,
      new BookingRequestRouter().router
    );

    //flight booking router
    this.Router.use(
      '/flight-booking',
      this.authChecker.userAuthChecker,
      new flightBookingRouter().router
    );

    //ticket router
    this.Router.use(
      '/ticket-issue',
      this.authChecker.userAuthChecker,
      this.TicketRouter.router
    );

    //booking service router
    this.Router.use(
      '/booking-support',
      this.authChecker.userAuthChecker,
      new BtoCBookingServiceRouter().router
    );

    // tour package router
    this.Router.use('/tour-package', new tourPackageBTOCRouter().router);

    // umrah package router
    this.Router.use('/umrah-package', new B2CUmrahPackageRouter().router);

    //tour package booking
    this.Router.use(
      '/tour-package-booking',
      this.authChecker.userAuthChecker,
      new tourPackageBookingBTOCRouter().router
    );

    //umrah package booking
    this.Router.use(
      '/umrah-package-booking',
      this.authChecker.userAuthChecker,
      new UmrahPackageBookingRouter().router
    );

    // spcecial offer
    this.Router.use('/special-offer', this.specailOfferBToCRotuer.router);

    //manual bank transfer
    this.Router.use(
      '/manual-bank-transfer',
      this.authChecker.userAuthChecker,
      this.manualBankTransferRouter.router
    );
  }
}
export default B2CRootRouter;
