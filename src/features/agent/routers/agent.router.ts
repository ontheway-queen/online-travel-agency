import AbstractRouter from "../../../abstract/abstract.router";
import { BtobController } from "../controllers/agent.controller";

export class BtobRouter extends AbstractRouter {
  private controller = new BtobController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //insert deposit request, list
    this.router
      .route("/deposit-request")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER),
        this.controller.insertDeposit
      )
      .get(this.controller.getAllDepositRequestList);

    //single application
    this.router
      .route("/deposit-request/:id")
      .get(this.controller.getSingleApplication);

    //get notifications, insert notification seen
    this.router
      .route("/notification")
      .get(this.controller.getNotification)
      .post(this.controller.insertNotificationSeen);

    //search booking info
    this.router.route("/search").get(this.controller.searchBookingInfo);

    //search history
    this.router.route("/search-history").get(this.controller.getSearchHistory);
  }
}
