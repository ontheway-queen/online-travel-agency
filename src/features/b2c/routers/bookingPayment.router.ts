import AbstractRouter from "../../../abstract/abstract.router";
import { BookingPaymentController } from "../controllers/bookingPayment.controller";

export class BookingPaymentRouter extends AbstractRouter {
  private controller = new BookingPaymentController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //invoice list
    this.router.route("/invoice").get(this.controller.getInvoice);

    //get single invoice
    this.router.route("/invoice/:id").get(this.controller.singleInvoice);

    //transaction list
    this.router.route("/transaction").get(this.controller.getTransaction);

    // bkash payment
    this.router
      .route("/create-bkash-payment")
      .post(this.controller.createBkashPayment);

    // ssl payment
    this.router
      .route("/ssl/:invoice_id")
      .post(this.controller.createSSLPayment);

    //payment
    this.router.route("/:invoice_id").post(this.controller.createPayment);
  }
}
