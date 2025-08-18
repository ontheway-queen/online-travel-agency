"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.B2BReissueRequestRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentReissueRequest_controller_1 = require("../controllers/agentReissueRequest.controller");
class B2BReissueRequestRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentReissueRequest_controller_1.B2BReissueRequestController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.createB2bRegistrationRequest)
            .get(this.controller.getReissueList);
        this.router
            .route("/:id")
            .get(this.controller.getSingleReissue)
            .patch(this.controller.updateReissueRequest);
    }
}
exports.B2BReissueRequestRouter = B2BReissueRequestRouter;
