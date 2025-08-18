import AbstractRouter from "../../../abstract/abstract.router";
import AdminConfigController from "../controllers/admin.config.controller";

class AdminConfigRouter extends AbstractRouter {
  private controller = new AdminConfigController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //create city
    this.router.route("/city").post(this.controller.createCity);

    // insert visa type
    this.router
      .route("/visa-type")
      .post(this.controller.insertVisaType)
      .get(this.controller.getAllVisaType);

    // delete visa type
    this.router
      .route("/visa-type/:id")
      .delete(this.controller.deleteVisaType);

    // insert visa mode
    this.router
      .route("/visa-mode")
      .post(this.controller.insertVisaMode)
      .get(this.controller.getAllVisaMode);

    // delete visa type
    this.router
      .route("/visa-mode/:id")
      .delete(this.controller.deleteVisaMode);

    // get notification
    this.router
      .route("/notification")
      .get(this.controller.getNotification)
      .post(this.controller.insertNotificationSeen);

    //get error logs
    this.router
      .route("/error-logs")
      .get(this.controller.getErrorLogs);

    //get audit trail
    this.router
      .route("/audit-trail")
      .get(this.controller.getAuditTrail);

    //search history
    this.router.route("/search-history")
      .get(this.controller.getSearchHistory);

    //insert airlines, get airlines
    this.router
      .route("/airlines")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AIRLINES_FILES),
        this.controller.insertAirlines
      );

    //update, delete airlines
    this.router
      .route("/airlines/:id")
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AIRLINES_FILES),
        this.controller.updateAirlines
      )
      .delete(this.controller.deleteAirlines);

    //insert airport, get airport
    this.router
      .route("/airport")
      .post(this.controller.insertAirport)
      .get(this.controller.getAllAirport);

    //update, delete airport
    this.router
      .route("/airport/:id")
      .patch(this.controller.updateAirport)
      .delete(this.controller.deleteAirport);
  }
}

export default AdminConfigRouter;
