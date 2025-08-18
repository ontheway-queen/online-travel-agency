import AbstractRouter from '../../../abstract/abstract.router';
import { AdminReportController } from '../controllers/admin.report.controller';

export class AdminReportRouter extends AbstractRouter {
  private controller = new AdminReportController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/b2c/payment-transaction')
      .get(this.controller.getB2CPaymentTransactionReport);

    this.router.route('/b2b/topup').get(this.controller.getB2BTopUpReport);

    this.router.route('/b2b/ledger').get(this.controller.getB2BLedgerReport);

    this.router.route('/b2b/sales').get(this.controller.getB2BSalesReport);

    this.router.route('/b2b/ticket-wise').get(this.controller.getB2BTicketWiseReport);

    this.router.route('/b2b/booking').get(this.controller.getB2BFlightBookingReport);

    this.router.route('/b2c/booking').get(this.controller.getB2CFlightBookingReport);
  }
}
