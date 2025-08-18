"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDealCodeRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const adminDealCode_controller_1 = require("../controllers/adminDealCode.controller");
class AdminDealCodeRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminDealCode_controller_1.AdminDealCodeController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.controller.create)
            .get(this.controller.getAll);
        this.router
            .route("/:id")
            .delete(this.controller.delete)
            .patch(this.controller.update);
    }
}
exports.AdminDealCodeRouter = AdminDealCodeRouter;
