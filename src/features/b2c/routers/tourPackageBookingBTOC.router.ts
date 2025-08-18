import AbstractRouter from "../../../abstract/abstract.router";
import { tourPackageBookingBTOController } from "../controllers/tourpackageBookingBTOC.controller";
export default class tourPackageBookingBTOCRouter extends AbstractRouter {
  private controller = new tourPackageBookingBTOController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    //get my booking history
    this.router.route("/history").get(this.controller.getMyBookingHistory);
    //create btoc tour package booking
    this.router.route("/").post(this.controller.createTourPackageBooking);
    //single booking info
    this.router.route("/:id").get(this.controller.getSingleBookingInfo);
  }
}
