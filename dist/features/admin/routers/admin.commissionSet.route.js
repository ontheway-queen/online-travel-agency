"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCommissionSetRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_commissionSet_controller_1 = require("../controllers/admin.commissionSet.controller");
class AdminCommissionSetRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new admin_commissionSet_controller_1.AdminCommissionSetController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/btoc")
            .post(this.controller.upsertBtoCCommission)
            .get(this.controller.getBtoCCommission);
        this.router
            .route('/')
            .post(this.controller.createCommissionSet)
            .get(this.controller.getCommissionSet);
        this.router
            .route('/:id')
            .get(this.controller.getSingleCommissionSet)
            .put(this.controller.updateCommissionSet);
    }
}
exports.AdminCommissionSetRouter = AdminCommissionSetRouter;
