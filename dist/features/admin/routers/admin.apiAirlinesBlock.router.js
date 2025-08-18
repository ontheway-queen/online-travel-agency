"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAPIAirlinesBlockRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_apiAirlinesBlock_controller_1 = require("../controllers/admin.apiAirlinesBlock.controller");
class AdminAPIAirlinesBlockRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new admin_apiAirlinesBlock_controller_1.AdminAPIAirlinesBlockController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/').post(this.controller.create);
        this.router
            .route('/:id')
            .get(this.controller.get)
            .patch(this.controller.update)
            .delete(this.controller.delete);
    }
}
exports.AdminAPIAirlinesBlockRouter = AdminAPIAirlinesBlockRouter;
