"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAgentPaymentRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminAgentPayment_controller_1 = require("../../controllers/adminAgentControllers/adminAgentPayment.controller");
class AdminAgentPaymentRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAgentPayment_controller_1.AdminAgentPaymentController();
        this.callRouter();
    }
    // call router
    callRouter() {
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
exports.AdminAgentPaymentRouter = AdminAgentPaymentRouter;
