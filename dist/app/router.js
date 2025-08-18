"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminRoot_router_1 = __importDefault(require("../features/admin/adminRoot.router"));
const auth_router_1 = __importDefault(require("../features/auth/auth.router"));
const agentRoot_router_1 = __importDefault(require("../features/agent/agentRoot.router"));
const b2cRoot_router_1 = __importDefault(require("../features/b2c/b2cRoot.router"));
const publicRoot_router_1 = __importDefault(require("../features/public/publicRoot.router"));
const publicPayment_router_1 = __importDefault(require("../features/public/routers/publicPayment.router"));
const authChecker_1 = __importDefault(require("../middleware/authChecker/authChecker"));
class RootRouter {
    constructor() {
        this.v1Router = (0, express_1.Router)();
        this.authRouter = new auth_router_1.default();
        this.authChecker = new authChecker_1.default();
        this.callV1Router();
    }
    callV1Router() {
        //publics
        this.v1Router.use("/public", new publicRoot_router_1.default().Router);
        //payment
        this.v1Router.use("/payment", new publicPayment_router_1.default().router);
        //auth
        this.v1Router.use("/auth", this.authRouter.AuthRouter);
        //admin
        this.v1Router.use("/admin", this.authChecker.adminAuthChecker, new adminRoot_router_1.default().Router);
        //b2c
        this.v1Router.use("/b2c", new b2cRoot_router_1.default().Router);
        //agent
        this.v1Router.use("/agent", this.authChecker.b2bAuthChecker, new agentRoot_router_1.default().Router);
    }
}
exports.default = RootRouter;
