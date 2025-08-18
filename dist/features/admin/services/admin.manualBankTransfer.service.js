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
const moneyReceiptTemplate_1 = require("../../../utils/templates/moneyReceiptTemplate");
const bankTransferSuccessTemplate_1 = require("../../../utils/templates/bankTransferSuccessTemplate");
const bankTransferRejectTemplate_1 = require("../../../utils/templates/bankTransferRejectTemplate");
class ManualBankTransferService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // get manual bank transfer list
    getManualBankTransferList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.manualBankTransferModel(trx);
                const { status, limit, skip, from_date, to_date, user_id } = req.query;
                const data = yield model.getManualBankTransferList({
                    status,
                    limit,
                    skip,
                    user_id,
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
    // get single manual bank transfer
    getSingleManualBankTransfer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.manualBankTransferModel(trx);
                const { id } = req.params;
                const data = yield model.getSingleManualBankTransfer({
                    id,
                });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: data[0],
                };
            }));
        });
    }
    // update manual bank transfer
    updateManualBankTransfer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.manualBankTransferModel(trx);
                const { id } = req.params;
                const singleData = yield model.getSingleManualBankTransfer({
                    id,
                });
                if (!singleData.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const reqBody = Object.assign({}, req.body);
                if (singleData[0].status === "approved" ||
                    singleData[0].status === "rejected") {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Updates are not allowed after approval or rejection.",
                    };
                }
                const updatedData = yield model.updateManualBankTransfer(reqBody, id);
                const singleUser = yield this.Model.userModel(trx).getProfileDetails({
                    id: updatedData[0].user_id,
                });
                if (updatedData[0].status === "approved") {
                    const paymentModel = this.Model.paymentModel(trx);
                    const invoiceData = yield paymentModel.singleInvoice(updatedData[0].invoice_id);
                    const remainingDueAmount = invoiceData[0].due - updatedData[0].amount <= 0
                        ? 0
                        : invoiceData[0].due - updatedData[0].amount;
                    yield paymentModel.updateInvoice({ due: remainingDueAmount }, invoiceData[0].id);
                    if (invoiceData[0].ref_type === "flight") {
                        const flightModel = this.Model.btocFlightBookingModel(trx);
                        yield flightModel.updateBooking({ status: "PROCESSING" }, invoiceData[0].ref_id);
                    }
                    else if (invoiceData[0].ref_type === "visa") {
                        const visaModel = this.Model.VisaModel(trx);
                        yield visaModel.b2cUpdateApplication("PROCESSING", invoiceData[0].ref_id);
                    }
                    else if (invoiceData[0].ref_type === "tour") {
                        const tourModel = this.Model.tourPackageBookingModel(trx);
                        yield tourModel.updateSingleBooking(invoiceData[0].ref_id, {
                            status: "PROCESSING",
                        });
                    }
                    const moneyRecipt = yield paymentModel.createMoneyReceipt({
                        invoice_id: invoiceData[0].id,
                        amount: updatedData[0].amount,
                        payment_time: updatedData[0].created_at,
                        payment_type: updatedData[0].bank_name,
                        details: "Payment has been made via manual bank transfer",
                    });
                    const moneyTransferSuccessMailData = {
                        name: singleUser[0].first_name + " " + singleUser[0].last_name,
                        referenceNumber: invoiceData[0].invoice_number,
                        transferDate: new Date(updatedData[0].transfer_date)
                            .toLocaleString()
                            .split(",")[0],
                        amount: updatedData[0].amount,
                    };
                    yield lib_1.default.sendEmail(singleUser[0].email, `Payment Verification Successfully Approved.`, (0, bankTransferSuccessTemplate_1.bankTransferSuccessTemplate)(moneyTransferSuccessMailData));
                    const moneyReceiptMailData = {
                        name: singleUser[0].first_name + " " + singleUser[0].last_name,
                        invoiceNumber: invoiceData[0].invoice_number,
                        transactionId: "N/A",
                        paymentTime: new Date(updatedData[0].created_at).toLocaleString(),
                        amount: updatedData[0].amount,
                        paymentMethod: updatedData[0].bank_name,
                        paymentGateway: "Payment has been made via manual bank transfer",
                    };
                    yield lib_1.default.sendEmail(singleUser[0].email, `Money Receipt for Your Flight Booking ID : ${invoiceData[0].ref_id} | online travel agency`, (0, moneyReceiptTemplate_1.moneyReceiptTemplate)(moneyReceiptMailData));
                }
                if (updatedData[0].status === "rejected") {
                    const paymentModel = this.Model.paymentModel(trx);
                    const invoiceData = yield paymentModel.singleInvoice(updatedData[0].invoice_id);
                    const moneyTransferRejectMailData = {
                        name: singleUser[0].first_name + " " + singleUser[0].last_name,
                        referenceNumber: invoiceData[0].invoice_number,
                        transferDate: new Date(updatedData[0].transfer_date)
                            .toLocaleString()
                            .split(",")[0],
                        amount: updatedData[0].amount,
                    };
                    yield lib_1.default.sendEmail(singleUser[0].email, `Payment Verification Failed.`, (0, bankTransferRejectTemplate_1.bankTransferRejectTemplate)(moneyTransferRejectMailData));
                }
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
