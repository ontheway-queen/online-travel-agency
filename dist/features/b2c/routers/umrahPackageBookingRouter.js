"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UmrahPackageBookingRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const umrahPackageBooking_controller_1 = require("../controllers/umrahPackageBooking.controller");
class UmrahPackageBookingRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new umrahPackageBooking_controller_1.UmrahPackageBookingControllerForBtoc();
        this.callRouter();
    }
    callRouter() {
        //insert umrah package booking
        this.router.route("/").post(this.controller.umrahPackageBookingService);
        //get my booking history
        this.router.route("/history").get(this.controller.getMyBookingHistory);
        //get single booking
        this.router.route("/:id").get(this.controller.getSingleBooking);
    }
}
exports.UmrahPackageBookingRouter = UmrahPackageBookingRouter;
