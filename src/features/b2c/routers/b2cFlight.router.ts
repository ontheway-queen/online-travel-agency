import AbstractRouter from "../../../abstract/abstract.router";
import AuthChecker from "../../../middleware/authChecker/authChecker";
import B2CFlightController from "../controllers/b2cFlight.controller";

export default class B2CFlightRouter extends AbstractRouter {
  private controller = new B2CFlightController();
  private authChecker = new AuthChecker();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // search flight
    this.router.route("/search").post(this.controller.flightSearch);

    //flight search using sse
    this.router.route("/search/sse").get(this.controller.FlightSearchSSE);

    //flight revalidate
    this.router.route("/revalidate").get(this.controller.flightRevalidate);

    //get flight fare rules
    this.router.route("/fare-rules").get(this.controller.getFlightFareRule);

    //flight booking
    this.router
      .route("/booking")
      .post(
        this.authChecker.userAuthChecker,
        this.uploader.cloudUploadRaw(this.fileFolders.B2C_FLIGHT_BOOKING_FILES),
        this.controller.flightBooking
      )
      .get(
        this.authChecker.userAuthChecker,
        this.controller.getFlightBookingList
      );

    this.router
      .route("/booking/:id")
      //get single flight booking
      .get(
        this.authChecker.userAuthChecker,
        this.controller.getSingleFlightBooking
      )
      //flight booking cancel
      .delete(
        this.authChecker.userAuthChecker,
        this.controller.flightBookingCancel
      );
  }
}
