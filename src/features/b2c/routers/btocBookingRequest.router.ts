import AbstractRouter from '../../../abstract/abstract.router';
import BookingRequestController from '../controllers/btocBookingRequest.controller';

class BookingRequestRouter extends AbstractRouter {
  private controller = new BookingRequestController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    // Get all flight booking
    this.router
      .route('/')
      .post(this.controller.flightBookingRequest)
      .get(this.controller.getBookingReqList);
    // Get single flight booking
    this.router
      .route('/:id')
      .get(this.controller.getBookingReqSingle)
    // .delete(this.controller.cancelledBookingRequest);
  }
}
export default BookingRequestRouter;
