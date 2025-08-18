import AbstractRouter from "../../../abstract/abstract.router";
import { PaymentController } from "../controllers/adminPayment.controller";

export class PaymentRouter extends AbstractRouter {
  private controller = new PaymentController();
  constructor() {
    super();
    this.callRouter();
  }

  // call router
  private callRouter() {
    //Get invoice list
    this.router.route("/btoc/invoice").get(this.controller.getB2CInvoiceList);

    // Get single invoice
    this.router
      .route("/btoc/invoice/:id")
      .get(this.controller.getB2CSingleInvoice);

    //Get invoice list
    this.router.route("/btob/invoice").get(this.controller.getB2BInvoiceList);

    // Get single invoice
    this.router
      .route("/btob/invoice/:id")
      .get(this.controller.getB2BSingleInvoice);

    // partial payment list
    this.router
      .route("/btob/partial-payment-history")
      .get(this.controller.getPartialPaymentList);

    this.router
      .route("/btob/partial-payment/:id")
      .post(this.controller.clearPartialPaymentDue);

    //loan
    this.router
      .route("/b2b/loan")
      .post(this.controller.giveAgencyLoan)
      .get(this.controller.getAgenciesWithLoan);

    this.router
      .route("/b2b/loan-history")
      .get(this.controller.getAgencyLoanHistory);

    this.router
      .route("/b2b/loan-adjust")
      .post(this.controller.adjustAgencyLoan);

    this.router.route("/b2b/loan-req").get(this.controller.getLoanRequest);
    this.router
      .route("/b2b/loan-req/:id")
      .patch(this.controller.updateLoanRequest);

    // create & get all payment link
    this.router
      .route("/payment-link")
      .post(this.controller.createPaymentLink)
      .get(this.controller.getPaymentLinks);
  }
}
