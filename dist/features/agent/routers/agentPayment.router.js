"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingPaymentRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentPayment_controller_1 = require("../controllers/agentPayment.controller");
class BookingPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentPayment_controller_1.BookingPaymentController();
        this.callRouter();
    }
    callRouter() {
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
exports.BookingPaymentRouter = BookingPaymentRouter;
