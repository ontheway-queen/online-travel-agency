import AbstractRouter from '../../../abstract/abstract.router';

class flightBookingRouter extends AbstractRouter {
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Get all flight booking
    // this.router
    //   .route("/")
    //   .post(this.controller.flightBooking)
    //   .get(this.controller.getAllFlightBooking);
    // Get single flight booking
    // this.router
    //   .route("/:id")
    //   .get(this.controller.getSingleFlightBooking)
    //   .delete(this.controller.cancelFlightBooking);
  }
}
export default flightBookingRouter;
