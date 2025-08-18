import AbstractRouter from "../../../abstract/abstract.router";
import { AdminDealCodeController } from "../controllers/adminDealCode.controller";

export class AdminDealCodeRouter extends AbstractRouter {
  private controller = new AdminDealCodeController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    this.router
      .route("/")
      .post(this.controller.create)
      .get(this.controller.getAll);

    this.router
      .route("/:id")
      .delete(this.controller.delete)
      .patch(this.controller.update);
  }
}
