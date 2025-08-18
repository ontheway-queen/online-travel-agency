"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const flightBooking_controller_1 = __importDefault(require("../controllers/flightBooking.controller"));
class adminFlightBookingRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new flightBooking_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //refetch
        this.router.route('/refetch/:id').post(this.controller.fetchDataFromAPI);
        //edit booking info
        this.router.route('/edit/:id').patch(this.controller.editBooking);
        this.router.route('/send-mail/:id').post(this.controller.sendBookingMail);
        //manual booking
        this.router.route('/manual').post(this.uploader.cloudUploadRaw(this.fileFolders.B2C_FLIGHT_BOOKING_FILES), this.controller.manualBooking);
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
exports.default = adminFlightBookingRouter;
