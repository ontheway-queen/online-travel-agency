"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCurrencyRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminCurrency_controller_1 = require("../controllers/adminCurrency.controller");
class AdminCurrencyRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminCurrency_controller_1.AdminCurrencyController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/api-list").get(this.controller.getApiList);
        this.router.route("/api-wise").post(this.controller.createApiWiseCurrency)
            .get(this.controller.getApiWiseCurrency);
        this.router
            .route("/api-wise/:id")
            .delete(this.controller.deleteApiWiseCurrency)
            .patch(this.controller.updateApiWiseCurrency);
    }
}
exports.AdminCurrencyRouter = AdminCurrencyRouter;
