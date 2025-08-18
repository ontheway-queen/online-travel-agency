"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualBankTransferRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_manualBankTransfer_controller_1 = require("../controllers/admin.manualBankTransfer.controller");
class ManualBankTransferRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new admin_manualBankTransfer_controller_1.ManualBankTransferController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            //get all manual bank transfer list
            .get(this.controller.getManualBankTransferList);
        this.router
            .route('/:id')
            //get single manual bank transfer
            .get(this.controller.getSingleManualBankTransfer)
            //update manual bank transfer
            .patch(this.controller.updateManualBankTransfer);
    }
}
exports.ManualBankTransferRouter = ManualBankTransferRouter;
