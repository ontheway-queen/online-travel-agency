import AbstractRouter from '../../../abstract/abstract.router';
import { AdminUmrahPackageBookingController } from '../controllers/adminUmrahPackageBooking.controller';


export class adminUmrahPackageBookingRouter extends AbstractRouter {
  private controller = new AdminUmrahPackageBookingController();
  constructor() {
    super();
    this.callRouter();
  }

  // call router
  private callRouter() {
    // get user b2c tour package booking request
    this.router.route('/b2c/').get(this.controller.getAllUmrahPackageBooking);

    // get single info tour package booking && update tour package
    this.router
      .route('/b2c/:id')
      .get(this.controller.getSingleUmrahPackageBookingInfo)
      .patch(this.controller.updateUmrahPackage);


    // get user b2b tour package booking request
    // this.router.route('/b2b/').get(this.controller.getAllTourPackageBookingB2B);

    // get single info tour package booking && update tour package b2b
  //   this.router
  //     .route('/b2b/:id')
  //     .get(this.controller.getSingleBookingInfoB2B)
  //     .patch(this.controller.updateTourPackageB2B);
  }
}
