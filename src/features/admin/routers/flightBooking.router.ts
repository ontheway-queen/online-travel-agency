import AbstractRouter from "../../../abstract/abstract.router";
import adminFlightBookingController from "../controllers/flightBooking.controller";

class adminFlightBookingRouter extends AbstractRouter {
  private controller = new adminFlightBookingController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    //refetch
    this.router.route('/refetch/:id').post(this.controller.fetchDataFromAPI);

    //edit booking info
    this.router.route('/edit/:id').patch(this.controller.editBooking);

    this.router.route('/send-mail/:id').post(this.controller.sendBookingMail);

    //manual booking
    this.router.route('/manual').post(
      this.uploader.cloudUploadRaw(
        this.fileFolders.B2C_FLIGHT_BOOKING_FILES
      ),
      this.controller.manualBooking);

    // get pnr details
    this.router.route("/pnr-details").post(this.controller.getPnrDetails);

    // Get all flight booking
    this.router.route("/").get(this.controller.getAllFlightBooking);

    // update blocked booking
    this.router
      .route("/update-blocked-booking/:id")
      .patch(this.controller.updateBlockedBooking);

    this.router
      .route("/:id")
      // Get single flight booking
      .get(this.controller.getSingleFlightBooking)
      //cancel flight booking
      .delete(this.controller.cancelFlightBooking)
      .patch(this.controller.updateBooking);

    //ticket issue
    this.router.route("/ticket-issue/:id").post(this.controller.issueTicket);
  }
}
export default adminFlightBookingRouter;
