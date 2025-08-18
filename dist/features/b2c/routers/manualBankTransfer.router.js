"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualBankTransferRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const manualBankTransfer_controller_1 = require("../controllers/manualBankTransfer.controller");
class ManualBankTransferRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new manualBankTransfer_controller_1.ManualBankTransferController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            //get all manual bank transfer list
            .get(this.controller.getManualBankTransferList)
            //create manual bank transfer
            .post(this.uploader.cloudUploadRaw(this.fileFolders.BANK_INVOICE_FILES), this.controller.createManualBankTransfer);
        this.router
            .route('/:id')
            //get single manual bank transfer
            .get(this.controller.getSingleManualBankTransfer);
        //update manual bank transfer
        // .patch(
        //   this.uploader.cloudUploadRaw(this.fileFolders.BANK_INVOICE_FILES),
        //   this.controller.updateManualBankTransfer
        // );
    }
}
exports.ManualBankTransferRouter = ManualBankTransferRouter;
