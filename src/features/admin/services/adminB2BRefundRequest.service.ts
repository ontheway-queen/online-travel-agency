import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { PROJECT_EMAIL_API_1, REFUND_STAFF_STATUS_ASSIGNED, REFUND_STATUS_APPROVED, REFUND_STATUS_EXPIRED, REFUND_STATUS_PROCESSING, REFUND_STATUS_REJECTED } from "../../../utils/miscellaneous/constants";
import { AgencyNotificationSubService } from "../../agent/services/subServices/agencyNotificationSubService";
import Lib from "../../../utils/lib/lib";
import { email_template_to_send_notification } from "../../../utils/templates/adminNotificationTemplate";

export class AdminB2BRefundRequestService extends AbstractServices {

    public async getRefundList(req: Request) {
        const model = this.Model.B2BRefundRequestModel();
        const query = req.query;
        const data = await model.getRefundRequestList({ ...query }, true);
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            total: data.total,
            data: data.data
        }
    }

    public async getSingleRefund(req: Request) {
        return this.db.transaction(async (trx) => {
            const { id: user_id } = req.admin;
            const { id } = req.params;
            const model = this.Model.B2BRefundRequestModel(trx);
            const data = await model.getSingleRefundRequest({ id: Number(id) });
            if (data.length) {
                if (data[0].staff_id !== user_id) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: "Only assigned staffs can see the refund details"
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: data[0]
                }
            } else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                }
            }
        })
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


    public async updateRefundRequest(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { id: user_id } = req.admin;
            const { id } = req.params;
            const refundModel = this.Model.B2BRefundRequestModel(trx);
            const body = req.body;
            const checkRefund = await refundModel.getSingleRefundRequest({ id: Number(id) });

            if (!checkRefund.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                }
            }
            if ([REFUND_STATUS_APPROVED, REFUND_STATUS_EXPIRED].includes(checkRefund[0].status)) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Cannot update this refund request. Check the refund status!"
                }
            }
            const { status, refund_amount, staff_id } = body;

            if (staff_id) {
                const checkStaff = await this.Model.adminModel(trx).getSingleAdmin({ id: staff_id });
                if (!checkStaff.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No staff has been found with this information"
                    }
                }
                await refundModel.updateRefundRequest({ staff_id, staff_status: REFUND_STAFF_STATUS_ASSIGNED }, Number(id));
            }
            if (status) {
                await refundModel.updateRefundRequest({ status, updated_by: user_id, refund_amount }, Number(id));
                let message = "";
                if (status === REFUND_STATUS_PROCESSING) {
                    message = `Refund Request for booking id - ${checkRefund[0].booking_ref} is in process. Please approve the request to continue the process`;
                } else if (status === REFUND_STATUS_REJECTED) {
                    message = `Refund Request for booking id - ${checkRefund[0].booking_ref} has been rejected. Please contact the admin for more information`;
                }
                const agencyNotificationSubService = new AgencyNotificationSubService(trx);
                await agencyNotificationSubService.insertNotification({
                    agency_id: checkRefund[0].agency_id,
                    message,
                    ref_id: Number(id),
                    type: "b2b_refund_request"
                })

                //send email to admin
                await Lib.sendEmail(
                    [PROJECT_EMAIL_API_1],
                    `Refund Request updated`,
                    email_template_to_send_notification({
                        title: "Refund request has been updated",
                        details: {
                            details: `Refund request for booking id ${checkRefund[0].booking_ref} has been updated.`
                        }
                    })
                );

                await Lib.sendEmail(
                    checkRefund[0].created_by_email,
                    `Refund Request updated`,
                    email_template_to_send_notification({
                        title: "Refund request has been updated",
                        details: {
                            details: `Refund request for booking id ${checkRefund[0].booking_ref} has been updated.`
                        }
                    })
                );
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
            }
        });
    }
}