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
exports.AdminB2BRefundRequestService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const agencyNotificationSubService_1 = require("../../agent/services/subServices/agencyNotificationSubService");
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const adminNotificationTemplate_1 = require("../../../utils/templates/adminNotificationTemplate");
class AdminB2BRefundRequestService extends abstract_service_1.default {
    getRefundList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.B2BRefundRequestModel();
            const query = req.query;
            const data = yield model.getRefundRequestList(Object.assign({}, query), true);
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
                const { id: user_id } = req.admin;
                const { id } = req.params;
                const model = this.Model.B2BRefundRequestModel(trx);
                const data = yield model.getSingleRefundRequest({ id: Number(id) });
                if (data.length) {
                    if (data[0].staff_id !== user_id) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_FORBIDDEN,
                            message: "Only assigned staffs can see the refund details"
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
    // public async updateRefundRequest(req: Request) {
    //     return await this.db.transaction(async (trx) => {
    //         const { id: user_id } = req.admin;
    //         const { id } = req.params;
    //         const refundModel = this.Model.B2BRefundRequestModel(trx);
    //         const body = req.body;
    //         const checkRefund = await refundModel.getSingleRefundRequest({ id: Number(id)});
    //         if(!checkRefund.length){
    //             return {
    //                 success: false,
    //                 code: this.StatusCode.HTTP_NOT_FOUND,
    //                 message: this.ResMsg.HTTP_NOT_FOUND
    //             }
    //         }
    //         if ([REFUND_STATUS_APPROVED, REFUND_STATUS_REJECTED].includes(checkRefund[0].status)) {
    //             return {
    //                 success: false,
    //                 code: this.StatusCode.HTTP_BAD_REQUEST,
    //                 message: "Cannot update this refund request. Check the refund status!"
    //             }
    //         }
    //         const { status, refund_amount, staff_id } = body;
    //         if(staff_id){
    //             const checkStaff = await this.Model.adminModel(trx).getSingleAdmin({id: staff_id});
    //             if(!checkStaff.length){
    //                 return{
    //                     success:false,
    //                     code: this.StatusCode.HTTP_NOT_FOUND,
    //                     message: "No staff has been found with this information"
    //                 }
    //             }
    //             await refundModel.updateRefundRequest({staff_id, staff_status: REFUND_STAFF_STATUS_ASSIGNED}, Number(id));
    //         }
    //         if(refund_amount){
    //             await refundModel.updateRefundRequest({refund_amount}, Number(id));
    //         }
    //         if ([REFUND_STATUS_PROCESSING,REFUND_STATUS_REJECTED].includes(status)) {
    //             await refundModel.updateRefundRequest({status, updated_by: user_id}, Number(id));
    //         }
    //         if(status === REFUND_STATUS_APPROVED){
    //             const bookingModel = this.Model.b2bFlightBookingModel(trx);
    //             const booking_traveler_data = await bookingModel.getFlightBookingTraveler(checkRefund[0].booking_id);
    //             const refund_tickets = await refundModel.getRefundRequestTickets(checkRefund[0].id);
    //             if(booking_traveler_data.length !== refund_tickets.length){
    //                 return {
    //                     success: false,
    //                     code: this.StatusCode.HTTP_CONFLICT,
    //                     message:"Split the booking before approving the refund request"
    //                 }
    //             }
    //             //update refund request status
    //             await refundModel.updateRefundRequest({status, updated_by: user_id}, Number(id));
    //             //update the booking status
    //             await bookingModel.updateBooking({status: FLIGHT_BOOKING_REFUNDED}, checkRefund[0].booking_id);
    //             //update invoice
    //             const paymentModel = this.Model.btobPaymentModel(trx);
    //             const getBooking = await bookingModel.getSingleFlightBooking({id: checkRefund[0].booking_id});
    //             await paymentModel.updateInvoice({due: 0, refund_amount: refund_amount}, getBooking[0].invoice_id);
    //             //transaction
    //             const agencyModel = this.Model.agencyModel(trx);
    //             await agencyModel.insertAgencyDeposit({
    //                 agency_id: checkRefund[0].agency_id,
    //                 type: "credit",
    //                 amount: refund_amount,
    //                 details: `Refunded for booking - ${getBooking[0].booking_ref}`
    //             });
    //             return{
    //                 success: true,
    //                 code: this.StatusCode.HTTP_OK,
    //                 message: "Booking has been refunded"
    //             }
    //         }
    //         return{
    //             success: true,
    //             code: this.StatusCode.HTTP_OK,
    //             message: "Refund request has been updated"
    //         }
    //     });
    // }
    updateRefundRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: user_id } = req.admin;
                const { id } = req.params;
                const refundModel = this.Model.B2BRefundRequestModel(trx);
                const body = req.body;
                const checkRefund = yield refundModel.getSingleRefundRequest({ id: Number(id) });
                if (!checkRefund.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND
                    };
                }
                if ([constants_1.REFUND_STATUS_APPROVED, constants_1.REFUND_STATUS_EXPIRED].includes(checkRefund[0].status)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: "Cannot update this refund request. Check the refund status!"
                    };
                }
                const { status, refund_amount, staff_id } = body;
                if (staff_id) {
                    const checkStaff = yield this.Model.adminModel(trx).getSingleAdmin({ id: staff_id });
                    if (!checkStaff.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No staff has been found with this information"
                        };
                    }
                    yield refundModel.updateRefundRequest({ staff_id, staff_status: constants_1.REFUND_STAFF_STATUS_ASSIGNED }, Number(id));
                }
                if (status) {
                    yield refundModel.updateRefundRequest({ status, updated_by: user_id, refund_amount }, Number(id));
                    let message = "";
                    if (status === constants_1.REFUND_STATUS_PROCESSING) {
                        message = `Refund Request for booking id - ${checkRefund[0].booking_ref} is in process. Please approve the request to continue the process`;
                    }
                    else if (status === constants_1.REFUND_STATUS_REJECTED) {
                        message = `Refund Request for booking id - ${checkRefund[0].booking_ref} has been rejected. Please contact the admin for more information`;
                    }
                    const agencyNotificationSubService = new agencyNotificationSubService_1.AgencyNotificationSubService(trx);
                    yield agencyNotificationSubService.insertNotification({
                        agency_id: checkRefund[0].agency_id,
                        message,
                        ref_id: Number(id),
                        type: "b2b_refund_request"
                    });
                    //send email to admin
                    yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_API_1], `Refund Request updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                        title: "Refund request has been updated",
                        details: {
                            details: `Refund request for booking id ${checkRefund[0].booking_ref} has been updated.`
                        }
                    }));
                    yield lib_1.default.sendEmail(checkRefund[0].created_by_email, `Refund Request updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                        title: "Refund request has been updated",
                        details: {
                            details: `Refund request for booking id ${checkRefund[0].booking_ref} has been updated.`
                        }
                    }));
                }
                // if (refund_amount) {
                //     await refundModel.updateRefundRequest({ refund_amount }, Number(id));
                //     await refundModel.updateRefundRequest({ status: REFUND_STATUS_PROCESSING, updated_by: user_id }, Number(id));
                //     const agencyNotificationSubService = new AgencyNotificationSubService(trx);
                //     await agencyNotificationSubService.insertNotification({
                //         agency_id: checkRefund[0].agency_id,
                //         message: `Refund Request for booking id - ${checkRefund[0].booking_ref} is in process. Please approve the request to continue the process`,
                //         ref_id: Number(id),
                //         type: "b2b_refund_request"
                //     })
                // }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: "Refund request has been updated"
                };
            }));
        });
    }
}
exports.AdminB2BRefundRequestService = AdminB2BRefundRequestService;
