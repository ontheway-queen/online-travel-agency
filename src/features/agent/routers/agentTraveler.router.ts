import BookingTravelerController from "../controllers/agentTraveler.controller";
import AbstractRouter from "../../../abstract/abstract.router";
import BtobTravelerController from "../controllers/agentTraveler.controller";

export default class BtobTravelerRouter extends AbstractRouter {
  private controller = new BtobTravelerController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // create and get router
    this.router
      .route("/")
      .post(
        // this.uploader.cloudUploadRaw(this.fileFolders.TRAVELER_FILES),
        this.controller.create
      )
      .get(this.controller.get);

    // get single and update
    this.router
      .route("/:id")
      .get(this.controller.getSingle)
      .patch(
        // this.uploader.cloudUploadRaw(this.fileFolders.TRAVELER_FILES),
        this.controller.update
      )
      .delete(this.controller.delete);
  }
}
