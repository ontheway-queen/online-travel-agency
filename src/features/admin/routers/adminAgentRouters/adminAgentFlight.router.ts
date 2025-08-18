import AbstractRouter from "../../../../abstract/abstract.router";
import AdminAgentFlightController from "../../controllers/adminAgentControllers/adminAgentFlight.controller";

class AdminB2BFlightBookingRouter extends AbstractRouter {
  private controller = new AdminAgentFlightController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //get pending ticket issuance list
    this.router
      .route("/pending-ticket-issuance")
      .get(this.controller.getPendingTicketIssuance);
    //update ticket issuance
    this.router
      .route("/pending-ticket-issuance/:id")
      .patch(this.controller.updateTicketIssuance);

    this.router.route("/edit/:id").patch(this.controller.editBooking);

    this.router.route("/send-mail/:id").post(this.controller.sendBookingMail);

    // Get all flight booking
    this.router.route("/").get(this.controller.getBookingList);

    // update blocked booking
    this.router
      .route("/update-blocked-booking/:id")
      .patch(this.controller.updateBlockedBooking);

    this.router.route("/reminder/:id").post(this.controller.reminderBooking);

    // Get single flight booking, cancel booking
    this.router
      .route("/:id")
      .get(this.controller.getBookingSingle)
      .delete(this.controller.flightBookingCancel)
      .patch(this.controller.updateBooking);

    // ticket issue
    this.router.route("/ticket-issue/:id").post(this.controller.ticketIssue);

    //pnr share
    this.router.route("/pnr-share").post(this.controller.pnrShare);

    // get pnr details
    this.router.route("/pnr-details").post(this.controller.getPnrDetails);

    //manual booking
    this.router
      .route("/manual")
      .post(
        this.uploader.cloudUploadRaw(
          this.fileFolders.AGENT_FLIGHT_BOOKING_FILES
        ),
        this.controller.manualBooking
      );

    //refetch
    this.router.route("/refetch/:id").post(this.controller.fetchDataFromAPI);
  }
}
export default AdminB2BFlightBookingRouter;
