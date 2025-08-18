"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDynamicFareRulesRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminDynamicFareRules_controller_1 = __importDefault(require("../controllers/adminDynamicFareRules.controller"));
class AdminDynamicFareRulesRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminDynamicFareRules_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/set')
            .post(this.controller.createSet)
            .get(this.controller.getSets);
        this.router
            .route('/set/clone/:id')
            .post(this.controller.cloneSet);
        this.router
            .route('/set/:id')
            .patch(this.controller.updateSet)
            .delete(this.controller.deleteSet);
        this.router.route('/supplier/api').get(this.controller.getSupplierList);
        this.router
            .route('/supplier')
            .post(this.controller.createSupplier)
            .get(this.controller.getSuppliers);
        this.router
            .route('/supplier/:id')
            .patch(this.controller.updateSupplier)
            .delete(this.controller.deleteSupplier);
        this.router
            .route('/airline-fare')
            .post(this.controller.createSupplierAirlinesFare)
            .get(this.controller.getSupplierAirlinesFares);
        this.router
            .route('/airline-fare/:id')
            .patch(this.controller.updateSupplierAirlinesFare)
            .delete(this.controller.deleteSupplierAirlinesFare);
        this.router
            .route('/fare-tax')
            .post(this.controller.createFareTax)
            .get(this.controller.getFareTaxes);
        this.router
            .route('/fare-tax/:id')
            .patch(this.controller.updateFareTax)
            .delete(this.controller.deleteFareTax);
        this.router
            .route('/b2c')
            .get(this.controller.getBtoCCommission)
            .patch(this.controller.upsertBtoCCommission);
    }
}
exports.AdminDynamicFareRulesRouter = AdminDynamicFareRulesRouter;
