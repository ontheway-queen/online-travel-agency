import AbstractRouter from "../../../abstract/abstract.router";
import { B2BRefundRequestController } from "../controllers/agentRefundRequest.controller";

export class B2BRefundRequestRouter extends AbstractRouter {
    private controller = new B2BRefundRequestController();

    constructor() {
        super();
        this.callRouter();
    }

    private callRouter() {
        this.router.route("/")
            .post(this.controller.createB2bRegistrationRequest)
            .get(this.controller.getRefundList);

        this.router.route("/:id")
            .get(this.controller.getSingleRefund)
            .patch(this.controller.updateRefundRequest);
    }
}