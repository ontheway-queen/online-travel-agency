import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";
import { LAST_ENTRY_TYPE_REISSUE, PROJECT_CODE, PROJECT_EMAIL_API_1, REISSUE_STATUS_APPROVED, REISSUE_STATUS_PROCESSING } from "../../../utils/miscellaneous/constants";
import {
    FLIGHT_TICKET_ISSUE
} from "../../../utils/miscellaneous/flightMiscellaneous/flightConstants";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";
import Lib from "../../../utils/lib/lib";
import { email_template_to_send_notification } from "../../../utils/templates/adminNotificationTemplate";
export class B2BReissueRequestService extends AbstractServices {

    public async createReissueRequest(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { id, agency_id } = req.agency;
            const reissueRequestModel = this.Model.B2BReissueRequestModel(trx);
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
                    message: "This booking is not eligible for reissue"
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


            const checkDuplicateReissueRequest = await reissueRequestModel.getSingleReissueRequest({ booking_id });

            if (checkDuplicateReissueRequest.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "Reissue request already exists with this booking"
                }
            }

            const last_entry = await lastServiceEntryModel.getLastRefId({ type: LAST_ENTRY_TYPE_REISSUE });
            const ref_no = `${PROJECT_CODE}-RD-${(Number(last_entry) + 1).toString().padStart(5, "0")}`;
            await this.Model.lastServiceEntryModel(trx).incrementLastRefId({ type: LAST_ENTRY_TYPE_REISSUE });


            const body = {
                ref_no,
                booking_id,
                reason,
                agency_id,
                created_by: id
            }

            const res = await reissueRequestModel.createReissueRequest(body);

            const traveler_body = traveler_id.map((elm: number) => {
                return {
                    reissue_request_id: res[0].id,
                    flight_booking_traveler_id: elm
                }
            })

            await reissueRequestModel.createReissueRequestTickets(traveler_body);

            await bookingModel.insertFlightBookingTracking({
                flight_booking_id: booking_id,
                details: `Reissue request ${ref_no} has been created against this booking`
            });

            const adminNotificationSubService = new AdminNotificationSubService(trx);
            await adminNotificationSubService.insertNotification({
                message: `New Reissue Request has been created for booking id - ${checkBooking[0].booking_ref}`,
                ref_id: res[0].id,
                type: "b2b_reissue_request"
            })

            //send email to admin
            await Lib.sendEmail(
                [PROJECT_EMAIL_API_1],
                `A new Reissue request has been created`,
                email_template_to_send_notification({
                    title: `A new Reissue request has been created`,
                    details: {
                        details: `A new Reissue request has been created`
                    }
                })
            );

            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Reissue request has been submitted",
                data: {
                    id: res[0].id
                }
            }
        });
    }

    public async getReissueList(req: Request) {
        const { agency_id } = req.agency;
        const model = this.Model.B2BReissueRequestModel();
        const query = req.query;
        const data = await model.getReissueRequestList({ ...query, agency_id }, true);
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            total: data.total,
            data: data.data
        }
    }

    public async getSingleReissue(req: Request) {
        return this.db.transaction(async (trx) => {
            const { agency_id } = req.agency;
            const { id } = req.params;
            const model = this.Model.B2BReissueRequestModel(trx);
            const data = await model.getSingleReissueRequest({ id: Number(id), agency_id });
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

    public async updateReissueRequest(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { id } = req.params;
            const { agency_id } = req.agency;
            const reissueModel = this.Model.B2BReissueRequestModel(trx);
            const checkReissue = await reissueModel.getSingleReissueRequest({ id: Number(id), agency_id });
            if (!checkReissue.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                }
            }

            if (checkReissue[0].status !== REISSUE_STATUS_PROCESSING) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Cannot approve the the reissue request"
                }
            }

            await reissueModel.updateReissueRequest({ status: REISSUE_STATUS_APPROVED }, Number(id));

            const adminNotificationSubService = new AdminNotificationSubService(trx);
            await adminNotificationSubService.insertNotification({
                message: `Reissue Request has been approved for booking id - ${checkReissue[0].booking_ref}`,
                ref_id: Number(id),
                type: "b2b_reissue_request"
            })
            //send email to admin
            await Lib.sendEmail(
                [PROJECT_EMAIL_API_1],
                `Reissue request has been updated`,
                email_template_to_send_notification({
                    title: 'Reissue request has been updated',
                    details: {
                        details: `Reissue request for booking ${checkReissue[0].booking_ref} has been updated`
                    }
                })
            );
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Reissue request has been approved"
            }
        });
    }
}