import AbstractRouter from "../../../abstract/abstract.router";
import { BookingPaymentController } from "../controllers/agentPayment.controller";

export class BookingPaymentRouter extends AbstractRouter {
  private controller = new BookingPaymentController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    //get invoice list
    this.router.route("/invoice").get(this.controller.getInvoice);

    //transaction list
    this.router.route("/transaction").get(this.controller.getTransaction);

    this.router
      .route("/partial-payment-history")
      .get(this.controller.getPartialPaymentList);

    // get total partial payment due
    this.router
      .route("/partial-payment-due")
      .get(this.controller.getPartialPaymentTotalDue);

    // deposit by gateway
    this.router
      .route("/create-deposit-order/brac")
      .post(this.controller.createDepositOrderByBracGateway);

    //get single invoice
    this.router
      .route("/invoice/:id")
      .get(this.controller.getSingleInvoice)
      .post(this.controller.clearInvoiceDue);

    //clear loan
    this.router.route("/clear-loan").post(this.controller.clearLoan);

    //========================= LOAN REQUEST ============================//
    //create loan request, get list
    this.router
      .route("/loan-req")
      .post(this.controller.createLoanRequest)
      .get(this.controller.getLoanRequest);

    //get loan history
    this.router.route("/loan-history").get(this.controller.getLoanHistory);

    //payment
    this.router.route('/ssl').post(this.controller.createSSLPayment);
    this.router.route("/").post(this.controller.CreateB2bBkashPayment);
  }
}
