"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const authChecker_1 = __importDefault(require("../../../middleware/authChecker/authChecker"));
const b2cFlight_controller_1 = __importDefault(require("../controllers/b2cFlight.controller"));
class B2CFlightRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new b2cFlight_controller_1.default();
        this.authChecker = new authChecker_1.default();
        this.callRouter();
    }
    callRouter() {
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
            .post(this.authChecker.userAuthChecker, this.uploader.cloudUploadRaw(this.fileFolders.B2C_FLIGHT_BOOKING_FILES), this.controller.flightBooking)
            .get(this.authChecker.userAuthChecker, this.controller.getFlightBookingList);
        this.router
            .route("/booking/:id")
            //get single flight booking
            .get(this.authChecker.userAuthChecker, this.controller.getSingleFlightBooking)
            //flight booking cancel
            .delete(this.authChecker.userAuthChecker, this.controller.flightBookingCancel);
    }
}
exports.default = B2CFlightRouter;
