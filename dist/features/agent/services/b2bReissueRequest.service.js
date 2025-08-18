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
exports.B2BReissueRequestService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const flightConstants_1 = require("../../../utils/miscellaneous/flightMiscellaneous/flightConstants");
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const adminNotificationTemplate_1 = require("../../../utils/templates/adminNotificationTemplate");
class B2BReissueRequestService extends abstract_service_1.default {
    createReissueRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, agency_id } = req.agency;
                const reissueRequestModel = this.Model.B2BReissueRequestModel(trx);
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
                        message: "This booking is not eligible for reissue"
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
                const checkDuplicateReissueRequest = yield reissueRequestModel.getSingleReissueRequest({ booking_id });
                if (checkDuplicateReissueRequest.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Reissue request already exists with this booking"
                    };
                }
                const last_entry = yield lastServiceEntryModel.getLastRefId({ type: constants_1.LAST_ENTRY_TYPE_REISSUE });
                const ref_no = `${constants_1.PROJECT_CODE}-RD-${(Number(last_entry) + 1).toString().padStart(5, "0")}`;
                yield this.Model.lastServiceEntryModel(trx).incrementLastRefId({ type: constants_1.LAST_ENTRY_TYPE_REISSUE });
                const body = {
                    ref_no,
                    booking_id,
                    reason,
                    agency_id,
                    created_by: id
                };
                const res = yield reissueRequestModel.createReissueRequest(body);
                const traveler_body = traveler_id.map((elm) => {
                    return {
                        reissue_request_id: res[0].id,
                        flight_booking_traveler_id: elm
                    };
                });
                yield reissueRequestModel.createReissueRequestTickets(traveler_body);
                yield bookingModel.insertFlightBookingTracking({
                    flight_booking_id: booking_id,
                    details: `Reissue request ${ref_no} has been created against this booking`
                });
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({
                    message: `New Reissue Request has been created for booking id - ${checkBooking[0].booking_ref}`,
                    ref_id: res[0].id,
                    type: "b2b_reissue_request"
                });
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `A new Reissue request has been created`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: `A new Reissue request has been created`,
                    details: {
                        details: `A new Reissue request has been created`
                    }
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Reissue request has been submitted",
                    data: {
                        id: res[0].id
                    }
                };
            }));
        });
    }
    getReissueList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const model = this.Model.B2BReissueRequestModel();
            const query = req.query;
            const data = yield model.getReissueRequestList(Object.assign(Object.assign({}, query), { agency_id }), true);
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
                const { agency_id } = req.agency;
                const { id } = req.params;
                const model = this.Model.B2BReissueRequestModel(trx);
                const data = yield model.getSingleReissueRequest({ id: Number(id), agency_id });
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
    updateReissueRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const { agency_id } = req.agency;
                const reissueModel = this.Model.B2BReissueRequestModel(trx);
                const checkReissue = yield reissueModel.getSingleReissueRequest({ id: Number(id), agency_id });
                if (!checkReissue.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                if (checkReissue[0].status !== constants_1.REISSUE_STATUS_PROCESSING) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Cannot approve the the reissue request"
                    };
                }
                yield reissueModel.updateReissueRequest({ status: constants_1.REISSUE_STATUS_APPROVED }, Number(id));
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({
                    message: `Reissue Request has been approved for booking id - ${checkReissue[0].booking_ref}`,
                    ref_id: Number(id),
                    type: "b2b_reissue_request"
                });
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Reissue request has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: 'Reissue request has been updated',
                    details: {
                        details: `Reissue request for booking ${checkReissue[0].booking_ref} has been updated`
                    }
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Reissue request has been approved"
                };
            }));
        });
    }
}
exports.B2BReissueRequestService = B2BReissueRequestService;
