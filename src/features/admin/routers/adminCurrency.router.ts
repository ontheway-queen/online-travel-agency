import AbstractRouter from "../../../abstract/abstract.router";
import { AdminCurrencyController } from "../controllers/adminCurrency.controller";

export class AdminCurrencyRouter extends AbstractRouter {
    private controller = new AdminCurrencyController();
    constructor() {
        super();
        this.callRouter();
    }
    private callRouter() {
        this.router.route("/api-list").get(this.controller.getApiList);
        
        this.router.route("/api-wise").post(this.controller.createApiWiseCurrency)
            .get(this.controller.getApiWiseCurrency);

        this.router
            .route("/api-wise/:id")
            .delete(this.controller.deleteApiWiseCurrency)
            .patch(this.controller.updateApiWiseCurrency);
    }
}
