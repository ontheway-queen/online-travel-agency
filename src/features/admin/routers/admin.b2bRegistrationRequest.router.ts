import AbstractRouter from "../../../abstract/abstract.router";
import { AdminBtoBRegistrationRequestController } from "../controllers/admin.b2bRegistrationRequest.controller";

export class AdminB2BRegistrationRequestRouter extends AbstractRouter {
  private controller = new AdminBtoBRegistrationRequestController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    // get all request
    this.router.route("/").get(this.controller.getAllRegistrationRequest);

    // get and update single request
    this.router
      .route("/:id")
      .get(this.controller.getSingleRegistrationRequest)
      .patch(this.controller.updateRegistrationRequest);
  }
}
