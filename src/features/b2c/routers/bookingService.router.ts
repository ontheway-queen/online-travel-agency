import AbstractRouter from "../../../abstract/abstract.router";
import BtoCBookingServiceController from "../controllers/bookingService.controller";

class BtoCBookingServiceRouter extends AbstractRouter {
  private controller = new BtoCBookingServiceController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    // create and get
    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.USER_FILES),
        this.controller.createSupport
      )
      .get(this.controller.getList);
    // create message, get single, close support
    this.router
      .route("/:id")
      .get(this.controller.getDetails)
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.USER_FILES),
        this.controller.createMessage
      );
    // .delete(this.controller.closeSupport);
  }
}

export default BtoCBookingServiceRouter;
