import AbstractRouter from "../../../abstract/abstract.router";
import { AdminB2BReissueRequestController } from "../controllers/adminB2BReissueRequest.controller";

export class AdminB2BReissueRequestRouter extends AbstractRouter{
    private controller = new AdminB2BReissueRequestController();

    constructor(){
        super();
        this.callRouter();
    }

    private callRouter(){
        this.router.route("/")
        .get(this.controller.getReissueList);

        this.router.route("/:id")
        .get(this.controller.getSingleReissue)
        .patch(this.controller.updateReissueRequest);
    }
}