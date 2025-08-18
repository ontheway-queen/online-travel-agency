import AbstractRouter from '../../../abstract/abstract.router';
import { UmrahPackageBookingBTOController } from '../controllers/agentUmrahPackageBooking.controller';
// import { tourPackageBookingBTOController } from '../controllers/tourpackageBookingBTOB.controller';

export default class UmrahPackageBookingBTOBRouter extends AbstractRouter {
  private controller = new UmrahPackageBookingBTOController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    //get my booking history
    this.router.route('/history').get(this.controller.getAgencyBookingHistory);
    //create Umrah package booking
    this.router.route('/').post(this.controller.createUmrahPackageBooking);
    //single booking info
    this.router.route('/:id').get(this.controller.getSingleBookingInfo);
  }
}
