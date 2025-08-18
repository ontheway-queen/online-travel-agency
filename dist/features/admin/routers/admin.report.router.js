"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminReportRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_report_controller_1 = require("../controllers/admin.report.controller");
class AdminReportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new admin_report_controller_1.AdminReportController();
        this.callRouter();
    }
    callRouter() {
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
exports.AdminReportRouter = AdminReportRouter;
