"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPartialPaymentRuleRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminPartialPaymentRules_controller_1 = require("../controllers/adminPartialPaymentRules.controller");
class AdminPartialPaymentRuleRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminPartialPaymentRules_controller_1.AdminPartialPaymentRuleController();
        this.callRouter();
    }
    callRouter() {
        this.router.get("/flight-apis", this.controller.getFlightAPIs);
        this.router
            .route("/")
            .post(this.controller.create)
            .get(this.controller.getAll);
        this.router
            .route("/:id")
            .patch(this.controller.update)
            .delete(this.controller.delete);
    }
}
exports.AdminPartialPaymentRuleRouter = AdminPartialPaymentRuleRouter;
