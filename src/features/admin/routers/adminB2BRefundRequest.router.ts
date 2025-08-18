import AbstractRouter from "../../../abstract/abstract.router";
import { AdminB2BRefundRequestController } from "../controllers/adminB2BRefundRequest.controller";

export class AdminB2BRefundRequestRouter extends AbstractRouter{
    private controller = new AdminB2BRefundRequestController();

    constructor(){
        super();
        this.callRouter();
    }

    private callRouter(){
        this.router.route("/")
        .get(this.controller.getRefundList);

        this.router.route("/:id")
        .get(this.controller.getSingleRefund)
        .patch(this.controller.updateRefundRequest);
    }
}