"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminB2BRegistrationRequestRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_b2bRegistrationRequest_controller_1 = require("../controllers/admin.b2bRegistrationRequest.controller");
class AdminB2BRegistrationRequestRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new admin_b2bRegistrationRequest_controller_1.AdminBtoBRegistrationRequestController();
        this.callRouter();
    }
    callRouter() {
        // get all request
        this.router.route("/").get(this.controller.getAllRegistrationRequest);
        // get and update single request
        this.router
            .route("/:id")
            .get(this.controller.getSingleRegistrationRequest)
            .patch(this.controller.updateRegistrationRequest);
    }
}
exports.AdminB2BRegistrationRequestRouter = AdminB2BRegistrationRequestRouter;
