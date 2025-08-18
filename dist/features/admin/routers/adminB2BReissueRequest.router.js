"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminB2BReissueRequestRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminB2BReissueRequest_controller_1 = require("../controllers/adminB2BReissueRequest.controller");
class AdminB2BReissueRequestRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminB2BReissueRequest_controller_1.AdminB2BReissueRequestController();
        this.callRouter();
    }
    callRouter() {
        this.router.route("/")
            .get(this.controller.getReissueList);
        this.router.route("/:id")
            .get(this.controller.getSingleReissue)
            .patch(this.controller.updateReissueRequest);
    }
}
exports.AdminB2BReissueRequestRouter = AdminB2BReissueRequestRouter;
