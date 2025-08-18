"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminFlightRouteConfigRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_flightRouteConfig_controller_1 = require("../controllers/admin.flightRouteConfig.controller");
class AdminFlightRouteConfigRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new admin_flightRouteConfig_controller_1.AdminFlightRouteConfigController();
        this.callRouter();
    }
    callRouter() {
        // Get create routes commission
        this.router
            .route('/set-commission/:id')
            .post(this.controller.createRoutesCommission)
            .get(this.controller.getRoutesCommission);
        // Update delete routes commission
        this.router
            .route('/set-commission/:commission_set_id/route/:id')
            .patch(this.controller.updateRoutesCommission)
            .delete(this.controller.deleteRoutesCommission);
        // Get create routes block
        this.router
            .route('/block')
            .post(this.controller.createRoutesBlock)
            .get(this.controller.getRoutesBlock);
        // Update delete routes block
        this.router
            .route('/block/:id')
            .patch(this.controller.updateRoutesBlock)
            .delete(this.controller.deleteRoutesBlock);
    }
}
exports.AdminFlightRouteConfigRouter = AdminFlightRouteConfigRouter;
