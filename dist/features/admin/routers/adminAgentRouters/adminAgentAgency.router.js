"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAgentAgencyRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../../abstract/abstract.router"));
const adminAgentAgency_controller_1 = require("../../controllers/adminAgentControllers/adminAgentAgency.controller");
class AdminAgentAgencyRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new adminAgentAgency_controller_1.AdminAgentAgencyController();
        this.callRouter();
    }
    // call router
    callRouter() {
        //agent portal login
        this.router.route("/login/:id").post(this.controller.agentPortalLogin);
        // deposit to agency
        this.router.route("/adjust-balance").post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_PAYMENT_SLIP_FILES), this.controller.adjustAgencyBalance);
        // deposit request
        this.router
            .route("/deposit-request")
            .get(this.controller.getAllDepositRequestList);
        // update deposit request
        this.router
            .route("/deposit-request/:id")
            .patch(this.controller.updateDepositRequest);
        //transaction list
        this.router.route("/transaction").get(this.controller.getAllTransaction);
        //get single agency all transection
        this.router
            .route("/transaction/:id")
            .get(this.controller.getSingleAgencyTransaction);
        // create get
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER), this.controller.create)
            .get(this.controller.get);
        // create user
        this.router
            .route("/user")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER), this.controller.createUser);
        // update user
        this.router
            .route("/user/:id")
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER), this.controller.updateUser);
        // update, get single
        this.router
            .route("/:id")
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER), this.controller.update)
            .get(this.controller.getSingle);
    }
}
exports.AdminAgentAgencyRouter = AdminAgentAgencyRouter;
