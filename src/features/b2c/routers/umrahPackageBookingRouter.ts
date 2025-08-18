import AbstractRouter from "../../../abstract/abstract.router";

import { UmrahPackageBookingControllerForBtoc } from "../controllers/umrahPackageBooking.controller";


export class UmrahPackageBookingRouter extends AbstractRouter{

    private controller;

    constructor() {
        super()
        this.controller = new UmrahPackageBookingControllerForBtoc()
        this.callRouter()
    }

    public callRouter() {

        //insert umrah package booking
        this.router.route("/").post(this.controller.umrahPackageBookingService)

        //get my booking history
        this.router.route("/history").get(this.controller.getMyBookingHistory);

        //get single booking
        this.router.route("/:id").get(this.controller.getSingleBooking)
    }
}