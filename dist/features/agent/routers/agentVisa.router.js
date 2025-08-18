"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.B2BVisaRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentVisa_controller_1 = require("../controllers/agentVisa.controller");
class B2BVisaRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentVisa_controller_1.B2BVisaController();
        this.callRouter();
    }
    callRouter() {
        //create application, list
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.VISA_FILES), this.controller.createApplication)
            .get(this.controller.getApplicationList);
        //single application
        this.router.route("/:id").get(this.controller.getSingleApplication);
    }
}
exports.B2BVisaRouter = B2BVisaRouter;
