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
exports.AdminB2BReissueRequestService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const agencyNotificationSubService_1 = require("../../agent/services/subServices/agencyNotificationSubService");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const adminNotificationTemplate_1 = require("../../../utils/templates/adminNotificationTemplate");
class AdminB2BReissueRequestService extends abstract_service_1.default {
    getReissueList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.B2BReissueRequestModel();
            const query = req.query;
            const data = yield model.getReissueRequestList(Object.assign({}, query), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data
            };
        });
    }
    getSingleReissue(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: user_id } = req.admin;
                const { id } = req.params;
                const model = this.Model.B2BReissueRequestModel(trx);
                const data = yield model.getSingleReissueRequest({ id: Number(id) });
                if (data.length) {
                    if (data[0].staff_id !== user_id) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_FORBIDDEN,
                            message: "Only assigned staffs can see the reissue details"
                        };
                    }
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: data[0]
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
            }));
        });
    }
    updateReissueRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: user_id } = req.admin;
                const { id } = req.params;
                const reissueModel = this.Model.B2BReissueRequestModel(trx);
                const body = req.body;
                const checkReissue = yield reissueModel.getSingleReissueRequest({ id: Number(id) });
                if (!checkReissue.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                if ([constants_1.REISSUE_STATUS_APPROVED, constants_1.REISSUE_STATUS_EXPIRED].includes(checkReissue[0].status)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Cannot update this reissue request. Check the reissue status!"
                    };
                }
                const { status, reissue_amount, staff_id } = body;
                if (staff_id) {
                    const checkStaff = yield this.Model.adminModel(trx).getSingleAdmin({ id: staff_id });
                    if (!checkStaff.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No staff has been found with this information"
                        };
                    }
                    yield reissueModel.updateReissueRequest({ staff_id, staff_status: constants_1.REISSUE_STAFF_STATUS_ASSIGNED }, Number(id));
                }
                if (status) {
                    yield reissueModel.updateReissueRequest({ status: constants_1.REISSUE_STATUS_PROCESSING, updated_by: user_id, reissue_amount }, Number(id));
                    let message = "";
                    if (status === constants_1.REISSUE_STATUS_PROCESSING) {
                        message = `Reissue Request for booking id - ${checkReissue[0].booking_ref} is in process. Please approve the request to continue the process`;
                    }
                    else if (status === constants_1.REISSUE_STATUS_REJECTED) {
                        message = "Reissue request has been rejected. Please contact the admin for more information";
                    }
                    const agencyNotificationSubService = new agencyNotificationSubService_1.AgencyNotificationSubService(trx);
                    yield agencyNotificationSubService.insertNotification({
                        agency_id: checkReissue[0].agency_id,
                        message,
                        ref_id: Number(id),
                        type: "b2b_reissue_request"
                    });
                    //send email to admin
                    yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Reissue Request updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                        title: "Reissue request has been updated",
                        details: {
                            details: `Reissue request for booking id ${checkReissue[0].booking_ref} has been updated.`
                        }
                    }));
                    yield lib_1.default.sendEmail(checkReissue[0].created_by_email, `Reissue Request updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                        title: "Reissue request has been updated",
                        details: {
                            details: `Reissue request for booking id ${checkReissue[0].booking_ref} has been updated.`
                        }
                    }));
                }
                // if (reissue_amount) {
                //     await reissueModel.updateReissueRequest({ reissue_amount }, Number(id));
                //     await reissueModel.updateReissueRequest({ status: REISSUE_STATUS_PROCESSING, updated_by: user_id }, Number(id));
                //     const agencyNotificationSubService = new AgencyNotificationSubService(trx);
                //     await agencyNotificationSubService.insertNotification({
                //         agency_id: checkReissue[0].agency_id,
                //         message: `Reissue Request for booking id - ${checkReissue[0].booking_ref} is in process. Please approve the request to continue the process`,
                //         ref_id: Number(id),
                //         type: "b2b_reissue_request"
                //     })
                // }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Reissue request has been updated"
                };
            }));
        });
    }
}
exports.AdminB2BReissueRequestService = AdminB2BReissueRequestService;
