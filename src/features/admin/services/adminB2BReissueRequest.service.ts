import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { PROJECT_EMAIL_API_1, REISSUE_STAFF_STATUS_ASSIGNED, REISSUE_STATUS_APPROVED, REISSUE_STATUS_EXPIRED, REISSUE_STATUS_PROCESSING, REISSUE_STATUS_REJECTED } from "../../../utils/miscellaneous/constants";
import { AgencyNotificationSubService } from "../../agent/services/subServices/agencyNotificationSubService";
import Lib from "../../../utils/lib/lib";
import { email_template_to_send_notification } from "../../../utils/templates/adminNotificationTemplate";


export class AdminB2BReissueRequestService extends AbstractServices {

    public async getReissueList(req: Request) {
        const model = this.Model.B2BReissueRequestModel();
        const query = req.query;
        const data = await model.getReissueRequestList({ ...query }, true);
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            total: data.total,
            data: data.data
        }
    }

    public async getSingleReissue(req: Request) {
        return this.db.transaction(async (trx) => {
            const { id: user_id } = req.admin;
            const { id } = req.params;
            const model = this.Model.B2BReissueRequestModel(trx);
            const data = await model.getSingleReissueRequest({ id: Number(id) });
            if (data.length) {
                if (data[0].staff_id !== user_id) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: "Only assigned staffs can see the reissue details"
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



    public async updateReissueRequest(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { id: user_id } = req.admin;
            const { id } = req.params;
            const reissueModel = this.Model.B2BReissueRequestModel(trx);
            const body = req.body;
            const checkReissue = await reissueModel.getSingleReissueRequest({ id: Number(id) });
            if (!checkReissue.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND
                }
            }
            if ([REISSUE_STATUS_APPROVED, REISSUE_STATUS_EXPIRED].includes(checkReissue[0].status)) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Cannot update this reissue request. Check the reissue status!"
                }
            }
            const { status, reissue_amount, staff_id } = body;

            if (staff_id) {
                const checkStaff = await this.Model.adminModel(trx).getSingleAdmin({ id: staff_id });
                if (!checkStaff.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "No staff has been found with this information"
                    }
                }
                await reissueModel.updateReissueRequest({ staff_id, staff_status: REISSUE_STAFF_STATUS_ASSIGNED }, Number(id));
            }
            if (status) {
                await reissueModel.updateReissueRequest({ status: REISSUE_STATUS_PROCESSING, updated_by: user_id, reissue_amount }, Number(id));
                let message = "";
                if (status === REISSUE_STATUS_PROCESSING) {
                    message = `Reissue Request for booking id - ${checkReissue[0].booking_ref} is in process. Please approve the request to continue the process`;
                } else if (status === REISSUE_STATUS_REJECTED) {
                    message = "Reissue request has been rejected. Please contact the admin for more information";
                }
                const agencyNotificationSubService = new AgencyNotificationSubService(trx);
                await agencyNotificationSubService.insertNotification({
                    agency_id: checkReissue[0].agency_id,
                    message,
                    ref_id: Number(id),
                    type: "b2b_reissue_request"
                })

                //send email to admin
                await Lib.sendEmail(
                    [PROJECT_EMAIL_API_1],
                    `Reissue Request updated`,
                    email_template_to_send_notification({
                        title: "Reissue request has been updated",
                        details: {
                            details: `Reissue request for booking id ${checkReissue[0].booking_ref} has been updated.`
                        }
                    })
                );

                await Lib.sendEmail(
                    checkReissue[0].created_by_email,
                    `Reissue Request updated`,
                    email_template_to_send_notification({
                        title: "Reissue request has been updated",
                        details: {
                            details: `Reissue request for booking id ${checkReissue[0].booking_ref} has been updated.`
                        }
                    })
                );
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
            }
        });
    }
}