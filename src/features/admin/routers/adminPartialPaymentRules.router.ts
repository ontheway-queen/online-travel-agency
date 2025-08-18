import AbstractRouter from "../../../abstract/abstract.router";
import { AdminPartialPaymentRuleController } from "../controllers/adminPartialPaymentRules.controller";

export class AdminPartialPaymentRuleRouter extends AbstractRouter {
  private controller = new AdminPartialPaymentRuleController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    this.router.get("/flight-apis", this.controller.getFlightAPIs);
    this.router
      .route("/")
      .post(this.controller.create)
      .get(this.controller.getAll);

    this.router
      .route("/:id")
      .patch(this.controller.update)
      .delete(this.controller.delete);
  }
}
