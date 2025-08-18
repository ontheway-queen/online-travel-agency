"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.B2BRefundRequestRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentRefundRequest_controller_1 = require("../controllers/agentRefundRequest.controller");
class B2BRefundRequestRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentRefundRequest_controller_1.B2BRefundRequestController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/")
            .post(this.controller.createB2bRegistrationRequest)
            .get(this.controller.getRefundList);
        this.router.route("/:id")
            .get(this.controller.getSingleRefund)
            .patch(this.controller.updateRefundRequest);
    }
}
exports.B2BRefundRequestRouter = B2BRefundRequestRouter;
