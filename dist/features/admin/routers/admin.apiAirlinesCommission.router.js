"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAPIAirlinesCommissionRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_apiAirlinesCommission_controller_1 = require("../controllers/admin.apiAirlinesCommission.controller");
class AdminAPIAirlinesCommissionRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new admin_apiAirlinesCommission_controller_1.AdminAPIAirlinesCommissionController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/').get(this.controller.getAllAPI);
        this.router
            .route('/set/commission/:id')
            .post(this.controller.updateAPIAirlinesCommission)
            .get(this.controller.getAPIAirlinesCommission);
    }
}
exports.AdminAPIAirlinesCommissionRouter = AdminAPIAirlinesCommissionRouter;
