import AbstractRouter from '../../../abstract/abstract.router';
import { tourPackageBookingBTOController } from '../controllers/agentTourpackageBooking.controller';

export default class tourPackageBookingBTOBRouter extends AbstractRouter {
  private controller = new tourPackageBookingBTOController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    //get my booking history
    this.router.route('/history').get(this.controller.getMyBookingHistory);
    //create tour package booking
    this.router.route('/').post(this.controller.createTourPackageBooking);
    //single booking info
    this.router.route('/:id').get(this.controller.getSingleBookingInfo);
  }
}
