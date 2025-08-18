import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";
import { LAST_ENTRY_TYPE_REFUND, PROJECT_CODE, PROJECT_EMAIL_API_1, REFUND_STATUS_APPROVED, REFUND_STATUS_PROCESSING } from "../../../utils/miscellaneous/constants";
import {
    FLIGHT_TICKET_ISSUE
} from "../../../utils/miscellaneous/flightMiscellaneous/flightConstants";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";
import Lib from "../../../utils/lib/lib";
import { email_template_to_send_notification } from "../../../utils/templates/adminNotificationTemplate";
export class B2BRefundRequestService extends AbstractServices {

    public async createRefundRequest(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { id, agency_id } = req.agency;
            const refundRequestModel = this.Model.B2BRefundRequestModel(trx);
            const lastServiceEntryModel = this.Model.lastServiceEntryModel(trx);
            const bookingModel = this.Model.b2bFlightBookingModel(trx);
            const { booking_id, reason, traveler_id } = req.body;
            const checkBooking = await bookingModel.getSingleFlightBooking({ id: booking_id, agency_id });
            if (!checkBooking.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "No booking has been found with this id"
                }
            }
            if (checkBooking[0].booking_status !== FLIGHT_TICKET_ISSUE) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "This booking is not eligible for refund"
                }
            }

            const checkTraveler = await bookingModel.getFlightBookingTraveler(booking_id, traveler_id);
            if (checkTraveler.length !== traveler_id.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "There is a mismatch in the traveler info"
                }
            }


            const checkDuplicateRefundRequest = await refundRequestModel.getSingleRefundRequest({ booking_id });

            if (checkDuplicateRefundRequest.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "Refund request already exists with this booking"
                }
            }

            const last_entry = await lastServiceEntryModel.getLastRefId({ type: LAST_ENTRY_TYPE_REFUND });
            const ref_no = `${PROJECT_CODE}-RD-${(Number(last_entry) + 1).toString().padStart(5, "0")}`;
            await this.Model.lastServiceEntryModel(trx).incrementLastRefId({ type: LAST_ENTRY_TYPE_REFUND });


            const body = {
                ref_no,
                booking_id,
                reason,
                agency_id,
                created_by: id
            }

            const res = await refundRequestModel.createRefundRequest(body);

            const traveler_body = traveler_id.map((elm: number) => {
                return {
                    refund_request_id: res[0].id,
                    flight_booking_traveler_id: elm
                }
            })

            await refundRequestModel.createRefundRequestTickets(traveler_body);

            await bookingModel.insertFlightBookingTracking({
                flight_booking_id: booking_id,
                details: `Refund request ${ref_no} has been created against this booking`
            });

            const adminNotificationSubService = new AdminNotificationSubService(trx);
            await adminNotificationSubService.insertNotification({
                message: `New Refund Request has been created for booking id - ${checkBooking[0].booking_ref}`,
                ref_id: res[0].id,
                type: "b2b_refund_request"
            })

            //send email to admin
            await Lib.sendEmail(
                [PROJECT_EMAIL_API_1],
                `A new refund request has been created`,
                email_template_to_send_notification({
                    title: `A new refund request has been created`,
                    details: {
                        details: `A new refund request has been created`
                    }
                })
            );

            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Refund request has been submitted",
                data: {
                    id: res[0].id
                }
            }
        });
    }

    public async getRefundList(req: Request) {
        const { agency_id } = req.agency;
        const model = this.Model.B2BRefundRequestModel();
        const query = req.query;
        const data = await model.getRefundRequestList({ ...query, agency_id }, true);
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            total: data.total,
            data: data.data
        }
    }

    public async getSingleRefund(req: Request) {
        return this.db.transaction(async (trx) => {
            const { agency_id } = req.agency;
            const { id } = req.params;
            const model = this.Model.B2BRefundRequestModel(trx);
            const data = await model.getSingleRefundRequest({ id: Number(id), agency_id });
            if (data.length) {
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

    public async updateRefundRequest(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { id } = req.params;
            const { agency_id } = req.agency;
            const refundModel = this.Model.B2BRefundRequestModel(trx);
            const checkRefund = await refundModel.getSingleRefundRequest({ id: Number(id), agency_id });
            if (!checkRefund.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                }
            }

            if (checkRefund[0].status !== REFUND_STATUS_PROCESSING) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Cannot approve the the refund request"
                }
            }

            await refundModel.updateRefundRequest({ status: REFUND_STATUS_APPROVED }, Number(id));

            const adminNotificationSubService = new AdminNotificationSubService(trx);
            await adminNotificationSubService.insertNotification({
                message: `Refund Request has been approved for booking id - ${checkRefund[0].booking_ref}`,
                ref_id: Number(id),
                type: "b2b_refund_request"
            })


            //send email to admin
            await Lib.sendEmail(
                [PROJECT_EMAIL_API_1],
                `Refund request has been updated`,
                email_template_to_send_notification({
                    title: 'Refund request has been updated',
                    details: {
                        details: `Refund request for booking ${checkRefund[0].booking_ref} has been updated`
                    }
                })
            );

            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Refund request has been approved"
            }
        });
    }
}