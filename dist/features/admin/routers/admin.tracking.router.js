"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_tracking_controller_1 = require("../controllers/admin.tracking.controller");
class TrackingRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.trackingController = new admin_tracking_controller_1.TrackingController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.trackingController.createTracking)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.VISA_FILES), this.trackingController.updateTracking);
        this.router.route('/:id').get(this.trackingController.getSingleTracking);
    }
}
exports.TrackingRouter = TrackingRouter;
