"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingPaymentRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const bookingPayment_controller_1 = require("../controllers/bookingPayment.controller");
class BookingPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new bookingPayment_controller_1.BookingPaymentController();
        this.callRouter();
    }
    callRouter() {
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
exports.BookingPaymentRouter = BookingPaymentRouter;
