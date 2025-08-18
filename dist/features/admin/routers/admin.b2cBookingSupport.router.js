"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBtoCBookingSupportRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_b2cBookingSupport_controller_1 = require("../controllers/admin.b2cBookingSupport.controller");
class AdminBtoCBookingSupportRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new admin_b2cBookingSupport_controller_1.AdminBtoCBookingSupportController();
        this.callRouter();
    }
    callRouter() {
        // get
        this.router.route('/').get(this.controller.getList);
        // create message, get single, close support
        this.router
            .route('/:id')
            .get(this.controller.getDetails)
            .post(this.uploader.cloudUploadRaw(this.fileFolders.USER_FILES), this.controller.createMessage)
            .delete(this.controller.closeSupport);
    }
}
exports.AdminBtoCBookingSupportRouter = AdminBtoCBookingSupportRouter;
