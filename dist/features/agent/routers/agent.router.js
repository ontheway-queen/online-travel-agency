"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BtobRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agent_controller_1 = require("../controllers/agent.controller");
class BtobRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agent_controller_1.BtobController();
        this.callRouter();
    }
    callRouter() {
        //insert deposit request, list
        this.router
            .route("/deposit-request")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER), this.controller.insertDeposit)
            .get(this.controller.getAllDepositRequestList);
        //single application
        this.router
            .route("/deposit-request/:id")
            .get(this.controller.getSingleApplication);
        //get notifications, insert notification seen
        this.router
            .route("/notification")
            .get(this.controller.getNotification)
            .post(this.controller.insertNotificationSeen);
        //search booking info
        this.router.route("/search").get(this.controller.searchBookingInfo);
        //search history
        this.router.route("/search-history").get(this.controller.getSearchHistory);
    }
}
exports.BtobRouter = BtobRouter;
