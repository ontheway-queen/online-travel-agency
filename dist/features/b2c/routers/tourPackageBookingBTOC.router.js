"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const tourpackageBookingBTOC_controller_1 = require("../controllers/tourpackageBookingBTOC.controller");
class tourPackageBookingBTOCRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new tourpackageBookingBTOC_controller_1.tourPackageBookingBTOController();
        this.callRouter();
    }
    callRouter() {
        //get my booking history
        this.router.route("/history").get(this.controller.getMyBookingHistory);
        //create btoc tour package booking
        this.router.route("/").post(this.controller.createTourPackageBooking);
        //single booking info
        this.router.route("/:id").get(this.controller.getSingleBookingInfo);
    }
}
exports.default = tourPackageBookingBTOCRouter;
