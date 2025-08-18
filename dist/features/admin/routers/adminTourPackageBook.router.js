"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminTourPackageBookingRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminTourPackageBooking_controller_1 = require("../controllers/adminTourPackageBooking.controller");
class adminTourPackageBookingRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminTourPackageBooking_controller_1.AdminTourPackageBookingController();
        this.callRouter();
    }
    // call router
    callRouter() {
        // get user b2c tour package booking request
        this.router.route('/b2c/').get(this.controller.getAllTourPackageBooking);
        // get single info tour package booking && update tour package
        this.router
            .route('/b2c/:id')
            .get(this.controller.getSingleTourPackageBookingInfo)
            .patch(this.controller.updateTourPackage);
        // get user b2b tour package booking request
        this.router.route('/b2b/').get(this.controller.getAllTourPackageBookingB2B);
        // get single info tour package booking && update tour package b2b
        this.router
            .route('/b2b/:id')
            .get(this.controller.getSingleBookingInfoB2B)
            .patch(this.controller.updateTourPackageB2B);
    }
}
exports.adminTourPackageBookingRouter = adminTourPackageBookingRouter;
