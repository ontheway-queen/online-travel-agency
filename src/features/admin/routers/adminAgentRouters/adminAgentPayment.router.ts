import AbstractRouter from "../../../../abstract/abstract.router";
import { AdminAgentPaymentController } from "../../controllers/adminAgentControllers/adminAgentPayment.controller";


export class AdminAgentPaymentRouter extends AbstractRouter {
    private controller = new AdminAgentPaymentController();
    constructor() {
        super();
        this.callRouter();
    }

    // call router
    private callRouter() {
      

        //Get invoice list
        this.router.route("/invoice").get(this.controller.getB2BInvoiceList);

        // Get single invoice
        this.router
            .route("/invoice/:id")
            .get(this.controller.getB2BSingleInvoice);

        // partial payment list
        this.router
            .route("/partial-payment-history")
            .get(this.controller.getPartialPaymentList);
    }
}
