import AbstractRouter from "../../../abstract/abstract.router";
import { B2BReissueRequestController } from "../controllers/agentReissueRequest.controller";

export class B2BReissueRequestRouter extends AbstractRouter {
  private controller = new B2BReissueRequestController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route("/")
      .post(this.controller.createB2bRegistrationRequest)
      .get(this.controller.getReissueList);

    this.router
      .route("/:id")
      .get(this.controller.getSingleReissue)
      .patch(this.controller.updateReissueRequest);
  }
}
