"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminAgentFlight_controller_1 = __importDefault(require("../../controllers/adminAgentControllers/adminAgentFlight.controller"));
class AdminB2BFlightBookingRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAgentFlight_controller_1.default();
        this.callRouter();
    }
    callRouter() {
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
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_FLIGHT_BOOKING_FILES), this.controller.manualBooking);
        //refetch
        this.router.route("/refetch/:id").post(this.controller.fetchDataFromAPI);
    }
}
exports.default = AdminB2BFlightBookingRouter;
