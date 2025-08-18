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
exports.B2BRefundRequestService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const flightConstants_1 = require("../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const adminNotificationTemplate_1 = require("../../../utils/templates/adminNotificationTemplate");
class B2BRefundRequestService extends abstract_service_1.default {
    createRefundRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, agency_id } = req.agency;
                const refundRequestModel = this.Model.B2BRefundRequestModel(trx);
                const lastServiceEntryModel = this.Model.lastServiceEntryModel(trx);
                const bookingModel = this.Model.b2bFlightBookingModel(trx);
                const { booking_id, reason, traveler_id } = req.body;
                const checkBooking = yield bookingModel.getSingleFlightBooking({ id: booking_id, agency_id });
                if (!checkBooking.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No booking has been found with this id"
                    };
                }
                if (checkBooking[0].booking_status !== flightConstants_1.FLIGHT_TICKET_ISSUE) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "This booking is not eligible for refund"
                    };
                }
                const checkTraveler = yield bookingModel.getFlightBookingTraveler(booking_id, traveler_id);
                if (checkTraveler.length !== traveler_id.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "There is a mismatch in the traveler info"
                    };
                }
                const checkDuplicateRefundRequest = yield refundRequestModel.getSingleRefundRequest({ booking_id });
                if (checkDuplicateRefundRequest.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Refund request already exists with this booking"
                    };
                }
                const last_entry = yield lastServiceEntryModel.getLastRefId({ type: constants_1.LAST_ENTRY_TYPE_REFUND });
                const ref_no = `${constants_1.PROJECT_CODE}-RD-${(Number(last_entry) + 1).toString().padStart(5, "0")}`;
                yield this.Model.lastServiceEntryModel(trx).incrementLastRefId({ type: constants_1.LAST_ENTRY_TYPE_REFUND });
                const body = {
                    ref_no,
                    booking_id,
                    reason,
                    agency_id,
                    created_by: id
                };
                const res = yield refundRequestModel.createRefundRequest(body);
                const traveler_body = traveler_id.map((elm) => {
                    return {
                        refund_request_id: res[0].id,
                        flight_booking_traveler_id: elm
                    };
                });
                yield refundRequestModel.createRefundRequestTickets(traveler_body);
                yield bookingModel.insertFlightBookingTracking({
                    flight_booking_id: booking_id,
                    details: `Refund request ${ref_no} has been created against this booking`
                });
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({
                    message: `New Refund Request has been created for booking id - ${checkBooking[0].booking_ref}`,
                    ref_id: res[0].id,
                    type: "b2b_refund_request"
                });
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `A new refund request has been created`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: `A new refund request has been created`,
                    details: {
                        details: `A new refund request has been created`
                    }
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Refund request has been submitted",
                    data: {
                        id: res[0].id
                    }
                };
            }));
        });
    }
    getRefundList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const model = this.Model.B2BRefundRequestModel();
            const query = req.query;
            const data = yield model.getRefundRequestList(Object.assign(Object.assign({}, query), { agency_id }), true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data
            };
        });
    }
    getSingleRefund(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agency;
                const { id } = req.params;
                const model = this.Model.B2BRefundRequestModel(trx);
                const data = yield model.getSingleRefundRequest({ id: Number(id), agency_id });
                if (data.length) {
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
    updateRefundRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { agency_id } = req.agency;
                const refundModel = this.Model.B2BRefundRequestModel(trx);
                const checkRefund = yield refundModel.getSingleRefundRequest({ id: Number(id), agency_id });
                if (!checkRefund.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                if (checkRefund[0].status !== constants_1.REFUND_STATUS_PROCESSING) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Cannot approve the the refund request"
                    };
                }
                yield refundModel.updateRefundRequest({ status: constants_1.REFUND_STATUS_APPROVED }, Number(id));
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({
                    message: `Refund Request has been approved for booking id - ${checkRefund[0].booking_ref}`,
                    ref_id: Number(id),
                    type: "b2b_refund_request"
                });
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Refund request has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: 'Refund request has been updated',
                    details: {
                        details: `Refund request for booking ${checkRefund[0].booking_ref} has been updated`
                    }
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Refund request has been approved"
                };
            }));
        });
    }
}
exports.B2BRefundRequestService = B2BRefundRequestService;
