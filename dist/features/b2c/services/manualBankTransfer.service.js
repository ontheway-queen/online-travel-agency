"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualBankTransferService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const bankTransferSubmissionTemplate_1 = require("../../../utils/templates/bankTransferSubmissionTemplate");
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
const constants_1 = require("../../../utils/miscellaneous/constants");
class ManualBankTransferService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // create manual bank transfer
    createManualBankTransfer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const manualBankTransferModel = this.Model.manualBankTransferModel(trx);
                const { id: user_id, email } = req.user;
                const file = req.files;
                if (!file.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: "Please provide the bank receipt"
                    };
                }
                const reqBody = Object.assign({ invoice_copy: file[0].filename, user_id }, req.body);
                const data = yield manualBankTransferModel.getSingleManualBankTransfer({
                    invoice_id: req.body.invoice_id,
                    user_id: req.user.id,
                    status: 'pending',
                });
                if (data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'A bank transfer with the same invoice already in pending state.',
                    };
                }
                const res = yield manualBankTransferModel.createManualBankTransfer(reqBody);
                yield lib_1.default.sendEmail(email, 'Your Payment is Under Review', (0, bankTransferSubmissionTemplate_1.bankTransferSubmissionTemplate)());
                //send notification to admin
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({ message: `A new manual bank transfer request from B2C. Amount - ${req.body.amount}`, ref_id: res[0].id, type: constants_1.NOTIFICATION_TYPE_B2C_BANK_TRANSFER });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Your bank transfer request has been successfully submitted. Please wait for the Verification.',
                };
            }));
        });
    }
    // get manual bank transfer list
    getManualBankTransferList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.manualBankTransferModel(trx);
                const { id } = req.user;
                const { status, limit, skip, from_date, to_date } = req.query;
                const data = yield model.getManualBankTransferList({
                    status,
                    limit,
                    skip,
                    user_id: id,
                    from_date,
                    to_date,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    total: data.total[0].total,
                    data: data.data,
                };
            }));
        });
    }
    //get single manual bank transfer
    getSingleManualBankTransfer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.manualBankTransferModel(trx);
                const { id } = req.params;
                const data = yield model.getSingleManualBankTransfer({
                    id,
                    user_id: req.user.id,
                });
                if (!data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: data[0],
                };
            }));
        });
    }
    updateManualBankTransfer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.manualBankTransferModel(trx);
                const { id } = req.params;
                const file = req.files;
                const singleData = yield model.getSingleManualBankTransfer({
                    id,
                    user_id: req.user.id,
                });
                if (!singleData.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (singleData[0].status !== 'pending') {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Updates are not allowed after approval or rejection.',
                    };
                }
                const reqBody = Object.assign({}, req.body);
                if (file === null || file === void 0 ? void 0 : file.length) {
                    reqBody.invoice_copy = file[0].filename;
                    const invoice_image = singleData[0].invoice_copy;
                    yield this.manageFile.deleteFromCloud([invoice_image]);
                }
                yield model.updateManualBankTransfer(reqBody, id);
                //send notification to admin
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({ message: `A manual bank transfer has been updated from B2C`, ref_id: Number(id), type: constants_1.NOTIFICATION_TYPE_B2C_BANK_TRANSFER });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                };
            }));
        });
    }
}
exports.ManualBankTransferService = ManualBankTransferService;
