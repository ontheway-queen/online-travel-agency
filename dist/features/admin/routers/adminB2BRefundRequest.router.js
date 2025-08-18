"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminB2BRefundRequestRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminB2BRefundRequest_controller_1 = require("../controllers/adminB2BRefundRequest.controller");
class AdminB2BRefundRequestRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminB2BRefundRequest_controller_1.AdminB2BRefundRequestController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/")
            .get(this.controller.getRefundList);
        this.router.route("/:id")
            .get(this.controller.getSingleRefund)
            .patch(this.controller.updateRefundRequest);
    }
}
exports.AdminB2BRefundRequestRouter = AdminB2BRefundRequestRouter;
