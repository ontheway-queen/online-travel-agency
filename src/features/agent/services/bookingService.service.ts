import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../../utils/lib/lib";
import {
  NOTIFICATION_TYPE_B2B_BOOKING_SUPPORT,
  PROJECT_EMAIL_API_1,

  PROJECT_NAME,
} from "../../../utils/miscellaneous/constants";
import { BookingSupportTemplate } from "../../../utils/templates/bookingSupportTemplate";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";
export class BtoBBookingServiceService extends AbstractServices {
  constructor() {
    super();
  }
  //create support
  public async createSupport(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, agency_id, agency_name, name } = req.agency;
      const {
        booking_id,
        support_type,
        ticket_number,
        message,
        is_booking_supported,
      } = req.body;

      const booking_model = this.Model.b2bFlightBookingModel(trx);

      let booking_ref;
      if (booking_id) {
        const booking_data = await booking_model.getSingleFlightBooking({
          id: Number(booking_id),
          agency_id,
        });

        if (!booking_data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: this.ResMsg.HTTP_NOT_FOUND,
          };
        }
        booking_ref = booking_data[0].booking_ref;
      }

      const support_model = this.Model.btobBookingSupportModel(trx);

      // insert support
      const support_res = await support_model.insertSupport({
        booking_id: booking_id ? Number(booking_id) : undefined,
        agency_id,
        support_type,
        created_by: id,
        is_booking_supported,
      });

      const ticket_body = ticket_number?.map((element: any) => {
        return {
          support_id: support_res[0].id,
          traveler_id: element.traveler_id,
          ticket_number: element.ticket_number,
        };
      });

      if (ticket_body && ticket_body.length > 0) {
        // insert support ticket
        await support_model.insertSupportTicket(ticket_body);
      }

      const files = (req.files as Express.Multer.File[]) || [];
      const attachments: { type: string; file: string }[] = [];
      if (files?.length) {
        for (const element of files) {
          let type = element.mimetype.split("/")[0];
          if (type === "application") {
            type = "file";
          }
          const file = element.filename;
          attachments.push({ type, file });
        }
      }
      const attachmentsJSON = JSON.stringify(attachments);

      // insert support message
      await support_model.insertSupportMessage({
        support_id: support_res[0].id,
        message,
        attachment: attachmentsJSON,
        sender: "agent",
        sender_id: id,
      });

      // await this.Model.auditTrailModel().createBtoBAudit({
      //   agency_id,
      //   type: "create",
      //   created_by: id,
      //   details: `A support request has been created with support type '${support_type}' by user ID '${id}',  and booking ID '${
      //     booking_id ?? "N/A"
      //   }'.`,
      // });

      const agency = await this.Model.agencyModel(trx).getSingleAgency(agency_id);
      //send mail
      await Lib.sendEmail(
        [PROJECT_EMAIL_API_1],
        `B2B Support Created for booking id ${booking_ref} | ${PROJECT_NAME}`,
        BookingSupportTemplate({
          bookingId: booking_ref,
          supportType: support_type,
          createdBy: agency[0]?.agency_name,
          createdAt: new Date().toLocaleString(),
          messages: [
            {
              sender: name,
              sentAt: new Date().toLocaleString(),
              content: message,
            },
          ],
        })
      );

      //send notification to admin
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      await adminNotificationSubService.insertNotification({
        message: `A new support has been created from B2B.`,
        ref_id: support_res[0].id,
        type: NOTIFICATION_TYPE_B2B_BOOKING_SUPPORT,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: { id: support_res[0].id, attachmentsJSON },
      };
    })
  }

  //get list
  public async getList(req: Request) {
    const { agency_id } = req.agency;
    const { limit, skip, status } = req.query as unknown as {
      limit: number;
      skip: number;
      status: string;
    };
    const model = this.Model.btobBookingSupportModel();
    const data = await model.getList(agency_id, status, limit, skip);

    // console.log({ data });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }
  //get details
  public async getDetails(req: Request) {
    const { agency_id } = req.agency;
    const { limit, skip } = req.query as unknown as {
      limit: number;
      skip: number;
    };
    const { id: support_id } = req.params;
    const model = this.Model.btobBookingSupportModel();

    const support_data = await model.getSingleSupport({
      id: Number(support_id),
      agency_id,
    });

    if (!support_data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    const ticket_data = await model.getTickets(Number(support_id));
    const message_data = await model.getMessages({
      limit,
      skip,
      support_id: Number(support_id),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        ...support_data[0],
        ticket_data,
        total_message: message_data.total,
        message_data: message_data.data,
      },
    };
  }

  //create message
  public async createMessage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, agency_id, name } = req.agency;
      const { id: support_id } = req.params;
      const model = this.Model.btobBookingSupportModel(trx);
      const support_data = await model.getSingleSupport({
        id: Number(support_id),
        agency_id,
        notStatus: "closed",
      });
      if (!support_data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }
      const files = (req.files as Express.Multer.File[]) || [];
      const attachments: { type: string; file: string }[] = [];
      if (files?.length) {
        for (const element of files) {
          let type = element.mimetype.split("/")[0];
          if (type === "application") {
            type = "file";
          }
          const file = element.filename;
          attachments.push({ type, file });
        }
      }
      const attachmentsJSON = JSON.stringify(attachments);
      await model.insertSupportMessage({
        support_id: Number(support_id),
        message: req.body.message,
        attachment: attachmentsJSON,
        sender: "agent",
        sender_id: id,
      });
      //update last message time
      await model.updateSupport(
        { last_message_at: new Date() },
        Number(support_id)
      );

      // await this.Model.auditTrailModel().createBtoBAudit({
      //   agency_id,
      //   type: "create",
      //   created_by: id,
      //   details: `A message was added to support request ID '${support_id}' by user ID '${id}', Attachments: ${
      //     attachments.length > 0 ? "Yes" : "No"
      //   }.`,
      // });

      const agency = await this.Model.agencyModel(trx).getSingleAgency(agency_id);
      const booking_model = this.Model.b2bFlightBookingModel(trx);
      const booking_data = await booking_model.getSingleFlightBooking({
        id: Number(support_data[0].booking_id),
        agency_id,
      });
      //send mail
      await Lib.sendEmail(
        [PROJECT_EMAIL_API_1],
        `New incoming message from B2B support for booking id ${booking_data[0].booking_ref} | ${PROJECT_NAME}`,
        BookingSupportTemplate({
          bookingId: booking_data[0].booking_ref,
          supportType: support_data[0].support_type,
          createdBy: agency[0]?.agency_name,
          createdAt: support_data[0].created_at,
          messages: [
            {
              sender: name,
              sentAt: new Date().toLocaleString(),
              content: req.body.message,
            },
          ],
        })
      );

      //send notification to admin
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      await adminNotificationSubService.insertNotification({
        message: `A new incoming message from B2B booking support - ${req.body.message}`,
        ref_id: Number(support_id),
        type: NOTIFICATION_TYPE_B2B_BOOKING_SUPPORT,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: attachmentsJSON,
      };
    })
  }
  // //close support
  // public async closeSupport(req: Request) {
  //     const { id, agency_id } = req.agency;
  //     const {id:support_id} = req.params;
  //     const model = this.Model.btobBookingSupportModel();
  //     const support_data = await model.getSingleSupport({ id: Number(support_id), agent_id: id, notStatus: 'closed'  });
  //     if (!support_data.length) {
  //         return {
  //             success: false,
  //             code: this.StatusCode.HTTP_BAD_REQUEST,
  //             message: this.ResMsg.HTTP_BAD_REQUEST
  //         }
  //     }
  //     await model.updateSupport({status:'closed'}, Number(support_id));
  //     const auditTrailModel = this.Model.auditTrailModel();
  //     await auditTrailModel.createBtoBAudit({agency_id:agency_id,created_by: id, type: "delete", details: `closed support id ${support_id}`});
  //     return{
  //         success: true,
  //         code: this.StatusCode.HTTP_OK,
  //         message: this.ResMsg.HTTP_OK
  //     }
  // }
}
