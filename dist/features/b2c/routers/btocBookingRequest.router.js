"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const btocBookingRequest_controller_1 = __importDefault(require("../controllers/btocBookingRequest.controller"));
class BookingRequestRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new btocBookingRequest_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // Get all flight booking
        this.router
            .route('/')
            .post(this.controller.flightBookingRequest)
            .get(this.controller.getBookingReqList);
        // Get single flight booking
        this.router
            .route('/:id')
            .get(this.controller.getBookingReqSingle);
        // .delete(this.controller.cancelledBookingRequest);
    }
}
exports.default = BookingRequestRouter;
