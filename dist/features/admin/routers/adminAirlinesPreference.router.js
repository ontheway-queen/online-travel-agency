"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAirlinesPreferenceRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminAirlinesPreference_controller_1 = __importDefault(require("../controllers/adminAirlinesPreference.controller"));
class AdminAirlinesPreferenceRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAirlinesPreference_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.controller.createAirlinePreference)
            .get(this.controller.getAirlinesPreferences);
        this.router
            .route('/:id')
            .patch(this.controller.updateAirlinePreference)
            .delete(this.controller.deleteAirlinePreference);
    }
}
exports.AdminAirlinesPreferenceRouter = AdminAirlinesPreferenceRouter;
