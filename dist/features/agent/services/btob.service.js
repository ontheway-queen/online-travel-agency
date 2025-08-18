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
exports.BtobService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
const constants_1 = require("../../../utils/miscellaneous/constants");
const depositTemplates_1 = require("../../../utils/templates/depositTemplates");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
class BtobService extends abstract_service_1.default {
    //create visa application
    insertDeposit(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_name, agency_logo, email: user_email } = req.agency;
                const files = req.files || [];
                if (files.length) {
                    req.body["docs"] = files[0].filename;
                }
                const res = yield this.Model.agencyModel(trx).insertAgencyDepositRequest(Object.assign(Object.assign({}, req.body), { agency_id: req.agency.agency_id }));
                //send notification to admin
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({
                    message: `A new deposit request has been created from B2B. Agency - ${agency_name} | Amount - ${req.body.amount}`,
                    ref_id: res[0].id,
                    type: constants_1.NOTIFICATION_TYPE_B2B_DEPOSIT_REQUEST,
                });
                // send emails
                yield Promise.all([
                    lib_1.default.sendEmail([
                        constants_1.PROJECT_EMAIL_ACCOUNT_1,
                    ], "New Deposit Request Received", (0, depositTemplates_1.template_onDepositReqInsert_send_to_admin)({
                        title: "New Deposit Request",
                        bank_name: req.body.bank_name,
                        total_amount: req.body.amount,
                        agency_name,
                        remarks: req.body.remarks,
                        payment_date: req.body.payment_date,
                    })),
                    lib_1.default.sendEmail(user_email, "Deposit Request Acknowledgement", (0, depositTemplates_1.template_onDepositReqInsert_send_to_agent)({
                        title: "Deposit Request Acknowledgement",
                        bank_name: req.body.bank_name,
                        total_amount: req.body.amount,
                        agency_name,
                        remarks: req.body.remarks,
                        payment_date: req.body.payment_date,
                    })),
                ]);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    //get list
    getAllDepositRequestList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const { limit, skip, status } = req.query;
            const data = yield this.Model.agencyModel().getAllAgencyDepositRequest({
                agency_id,
                limit: Number(limit),
                skip: Number(skip),
                status: status,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get single
    getSingleApplication(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: agent_id } = req.agency;
            const id = req.params.id;
            const model = this.Model.VisaModel();
            const data = yield model.b2bSingleApplication(Number(id), agent_id);
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const traveler_data = yield model.b2bTravelerList(Number(id));
            const tracking_data = yield model.b2bTrackingList(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: Object.assign(Object.assign({}, data[0]), { traveler_data, tracking_data }),
            };
        });
    }
    //get notification
    getNotification(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, agency_id } = req.agency;
            const model = this.Model.agencyNotificationModel();
            const query = req.query;
            const data = yield model.getNotifications(Object.assign(Object.assign({}, query), { agency_id, user_id: id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //insert notification seen
    insertNotificationSeen(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.agency;
            const model = this.Model.agencyNotificationModel();
            const { notification_id } = req.body;
            if (!notification_id) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                    message: this.ResMsg.HTTP_UNPROCESSABLE_ENTITY,
                };
            }
            const checkNotification = yield model.checkNotificationSeen({
                notification_id,
                user_id: id,
            });
            if (!checkNotification.length) {
                yield model.insertNotificationSeen({ notification_id, user_id: id });
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
            };
        });
    }
    //search booking info
    searchBookingInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const model = this.Model.b2bFlightBookingModel();
            const query = req.query;
            const data = yield model.searchBookingInfo(Object.assign(Object.assign({}, query), { agency_id }));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    //get search history
    getSearchHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.SearchHistoryModel();
            const { agency_id } = req.agency;
            const { type, from_date, to_date, limit, skip } = req.query;
            let data = {
                total: 0,
                data: [],
            };
            if (type === "flight") {
                data = yield model.getFlightSearchHistory({
                    from_date: from_date,
                    to_date: to_date,
                    limit: limit,
                    skip: skip,
                    agency_id,
                }, true);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
}
exports.BtobService = BtobService;
