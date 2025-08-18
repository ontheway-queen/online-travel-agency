import AbstractRouter from "../../../abstract/abstract.router";
import PublicPaymentController from "../controllers/publicPayment.controller";
class PublicPaymentRouter extends AbstractRouter {
  private Controller = new PublicPaymentController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route("/failed").post(this.Controller.paymentFailed);
    this.router.route("/success").post(this.Controller.paymentSuccess);
    this.router.route("/cancelled").post(this.Controller.paymentCancelled);

    this.router
      .route("/brac/payment-confirm/:ref_id")
      .post(this.Controller.b2cBracBankPaymentConfirm);

    this.router
      .route("/brac/payment-cancel/:ref_id")
      .post(this.Controller.bracBankPaymentCancel);

    // brac payment success for btob
    this.router
      .route("/btob/brc/success")
      .post(this.Controller.btobBracPaymentSuccess);

    // brac payment cancelled for btob
    this.router
      .route("/btob/brc/cancelled")
      .post(this.Controller.btobBracPaymentCancelled);

    // brac payment failed for btob
    this.router
      .route("/btob/brc/failed")
      .post(this.Controller.btobBracPaymentFailed);

    // b2c bkash callback url
    this.router
      .route("/b2c/bkash-callback-url")
      .get(this.Controller.b2cBkashCallbackUrl);

    // b2b bkash callback url
    this.router
      .route("/b2b/bkash-callback-url")
      .get(this.Controller.B2bBkashCallbackUrl);

    this.router
      .route("/payment-link/:id")
      .get(this.Controller.getSinglePaymentLink);

    //SSL
    this.router.route("/b2b/ssl/success").post(this.Controller.b2bSslSuccess);
    this.router.route("/b2b/ssl/failed").post(this.Controller.b2bSslFailed);
    this.router.route("/b2b/ssl/cancelled").post(this.Controller.b2bSslCancelled);
    this.router.route("/b2c/ssl/success").post(this.Controller.b2cSslSuccess);
    this.router.route("/b2c/ssl/failed").post(this.Controller.b2cSslFailed);
    this.router.route("/b2c/ssl/cancelled").post(this.Controller.b2cSslCancelled);
  }
}

export default PublicPaymentRouter;
