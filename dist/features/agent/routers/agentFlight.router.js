"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentFlight_controller_1 = __importDefault(require("../controllers/agentFlight.controller"));
class AgentFlightRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentFlight_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // search flight
        this.router.route('/search').post(this.controller.flightSearch);
        //flight search using sse
        this.router.route('/search/sse').get(this.controller.FlightSearchSSE);
        //airline list
        this.router.route('/airlines').get(this.controller.getAirlineList);
        //flight revalidate
        this.router.route('/revalidate').get(this.controller.flightRevalidate);
        //fare rules
        this.router.route('/fare-rules').get(this.controller.getFlightFareRule);
        //flight booking
        this.router
            .route('/booking')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENT_FLIGHT_BOOKING_FILES), this.controller.flightBooking)
            .get(this.controller.getBookingList);
        //flight booking cancel
        this.router
            .route('/booking/:id')
            .delete(this.controller.flightBookingCancel)
            .get(this.controller.getBookingSingle);
        //ticket issue
        this.router.route('/ticket-issue/:id').post(this.controller.ticketIssue);
    }
}
exports.default = AgentFlightRouter;
